using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PulseWatch.Business.Services;
using PulseWatch.Core.Interfaces.Repositories;
using PulseWatch.Core.Interfaces.Services;
using PulseWatch.Data.Context;
using PulseWatch.Data.Repositories;
using PulseWatch.Data.UnitOfWork;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// ========== LOGGING AU NIVEAU MAXIMUM ==========
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Logging.SetMinimumLevel(LogLevel.Trace);

// ========== CONTROLLERS ==========
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ========== SWAGGER AVEC JWT ==========
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PulseWatch API",
        Version = "v1",
        Description = "API pour le monitoring de tendances et flux RSS"
    });
    
    // ✅ Bouton Authorize dans Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
    
    // Inclure les commentaires XML si disponible
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// ========== DATABASE ==========
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("PulseWatch.API")));

// ========== MEMORY CACHE & HTTP CLIENT ==========
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

// ========== REPOSITORIES ==========
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IFeedRepository, FeedRepository>();
builder.Services.AddScoped<INoteRepository, NoteRepository>();
builder.Services.AddScoped<ITrendRepository, TrendRepository>();
builder.Services.AddScoped<ISummaryRepository, SummaryRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// ========== UNIT OF WORK ==========
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// ========== SERVICES ==========
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IFeedService, FeedService>();
builder.Services.AddScoped<INoteService, NoteService>();
builder.Services.AddScoped<ITrendService, TrendService>();
builder.Services.AddScoped<ISummaryService, SummaryService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// ========== AGENT DE DIGEST (service Python ADK, hors process) ==========
// Typed client : l'URL vient de la configuration, jamais du code [R-02].
// Timeout a 3 min et non les 100 s par defaut : l'agent enchaine plusieurs
// appels LLM et rouvre les articles cites pour les verifier.
builder.Services.AddHttpClient<IDigestGenerator, DigestAgentClient>(client =>
{
    var baseUrl = builder.Configuration["DigestAgent:BaseUrl"]
        ?? throw new InvalidOperationException(
            "DigestAgent:BaseUrl n'est pas configure. L'API refuse de demarrer "
            + "plutot que d'echouer au premier digest.");

    client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromMinutes(3);
});

// ========== AUTOMAPPER ==========
// Dans Program.cs, remplacer par :
builder.Services.AddAutoMapper(
    typeof(PulseWatch.Core.Mappings.UserMappingProfile),
    typeof(PulseWatch.Core.Mappings.CategoryMappingProfile),
    typeof(PulseWatch.Core.Mappings.FeedMappingProfile),
    typeof(PulseWatch.Core.Mappings.NoteMappingProfile),
    typeof(PulseWatch.Core.Mappings.TrendMappingProfile),
    typeof(PulseWatch.Core.Mappings.SummaryMappingProfile)
);
// ========== AUTHENTIFICATION JWT ==========
var jwtKey = builder.Configuration["Jwt:Key"] 
    ?? throw new InvalidOperationException("JWT Key not configured!");

if (jwtKey.Length < 32)
    throw new InvalidOperationException("JWT Key must be >= 32 chars");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices
                .GetRequiredService<ILogger<Program>>();
            logger.LogError("JWT Authentication Failed - Error: {Error} | Exception: {Exception}", 
                context.Exception.Message, context.Exception.ToString());
            logger.LogError("JWT Token: {Token}", context.Request.Headers["Authorization"].ToString());
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var logger = context.HttpContext.RequestServices
                .GetRequiredService<ILogger<Program>>();
            logger.LogInformation("JWT Token Validated - User: {User} | Expires: {Expires}", 
                context.Principal?.Identity?.Name, 
                context.Properties?.ExpiresUtc);
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            var logger = context.HttpContext.RequestServices
                .GetRequiredService<ILogger<Program>>();
            logger.LogWarning("JWT Challenge - Error: {Error} | Description: {Description}", 
                context.Error, context.ErrorDescription);
            return Task.CompletedTask;
        },
        OnMessageReceived = context =>
        {
            var logger = context.HttpContext.RequestServices
                .GetRequiredService<ILogger<Program>>();
            logger.LogDebug("JWT Token received - Token: {Token}", context.Token);
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ========== CORS ==========
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentPolicy", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000","http://localhost:3001", "http://localhost:3002", 
                "http://localhost:3003","http://localhost:5173","http://localhost:5174", 
                "http://localhost:7115", "https://localhost:3000","https://localhost:3001", 
                "https://localhost:3002", "https://localhost:3003","https://localhost:5173",
                "https://localhost:5174")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
    
    options.AddPolicy("ProductionPolicy", policy =>
    {
        policy
            .WithOrigins(
                builder.Configuration.GetSection("Cors:AllowedOrigins")
                    .Get<string[]>() ?? Array.Empty<string>())
            .WithMethods("GET", "POST", "PUT", "DELETE")
            .WithHeaders("Authorization", "Content-Type")
            .AllowCredentials();
    });
});

var app = builder.Build();

// ========== MIDDLEWARE PIPELINE ==========

// Gestion globale des exceptions
app.UseExceptionHandler("/error");

// HTTPS
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

// Swagger et CORS (dev seulement)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PulseWatch API v1");
        c.RoutePrefix = string.Empty; // Swagger à la racine
    });
    app.UseCors("DevelopmentPolicy");
}
else
{
    app.UseCors("ProductionPolicy");
}

app.UseHttpsRedirection();

// ⚠️ ORDRE CRITIQUE!
app.UseAuthentication();  // ← AVANT Authorization!
app.UseAuthorization();

app.MapControllers();

// Endpoint pour les erreurs
app.Map("/error", (HttpContext context) => Results.Problem());

// Applique les migrations en attente.
//
// EnsureCreated() ne les applique jamais : il cree le schema a partir du modele
// quand la base n'existe pas, et ne fait rien quand elle existe. Les migrations
// livrees dans Migrations/ n'etaient donc executees nulle part, et une base deja
// en place gardait son ancien schema. NullableSummaryTrendId ne serait jamais
// passee : le premier digest de categorie, dont le TrendId est null, aurait
// echoue sur une colonne restee NOT NULL — en production seulement, puisque sur
// une base neuve EnsureCreated produisait deja le bon schema.
//
// Une base creee auparavant par EnsureCreated n'a pas de table
// __EFMigrationsHistory : Migrate() tentera de rejouer la migration initiale et
// echouera sur des tables existantes. Il faut l'amorcer une fois, avec
// `dotnet ef migrations add ... --no-build` puis un INSERT des migrations deja
// contenues dans le schema, ou repartir d'une base vide.
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.Migrate();
}

app.Run();
