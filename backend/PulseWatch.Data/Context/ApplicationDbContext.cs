using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PulseWatch.Core.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace PulseWatch.Data.Context
{
    public class ApplicationDbContext : DbContext
    {
        // Constructeur avec injection des options
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSet : représente une table dans la BD
        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Trend> Trends { get; set; }

        public DbSet<Note> Notes { get; set; }
        public DbSet<Feed> Feeds { get; set; }
        public DbSet<Summary> Summaries { get; set; }

        // Configuration du modèle avec Fluent API
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Appel des méthodes de configuration
            ConfigureUser(modelBuilder);
            ConfigureCategory(modelBuilder);
            ConfigureTrend(modelBuilder);
            ConfigureFeed(modelBuilder);
            ConfigureNote(modelBuilder);
            ConfigureSummary(modelBuilder);

            // Insertion de données initiales
            SeedData(modelBuilder);
        }


        //Partie de Pierre 

        private void ConfigureCategory(ModelBuilder modelBuilder)
        {
            var entity = modelBuilder.Entity<Category>();

            entity.HasKey(u => u.Id);

            entity.Property(u => u.Name)
                  .IsRequired();


            entity.HasOne(u => u.User)
                 .WithMany(at => at.Categories)
                 .HasForeignKey(at => at.UserId)
                 .OnDelete(DeleteBehavior.Restrict); ;


        }
        private void ConfigureTrend(ModelBuilder modelBuilder)
        {
            var entity = modelBuilder.Entity<Trend>();

            entity.HasKey(u => u.Id);

            // Configure Value Converter pour Dictionary<string, double> -> JSON string
            entity.Property(u => u.Data)
                  .HasConversion(
                      v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                      v => JsonSerializer.Deserialize<Dictionary<string, double>>(v, (JsonSerializerOptions)null)
                  )
                  .IsRequired();

            entity.HasOne(u => u.Category)
                 .WithMany(at => at.Trends)
                 .HasForeignKey(at => at.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
        }
        private void ConfigureNote(ModelBuilder modelBuilder)
        {
            var entity = modelBuilder.Entity<Note>();

            entity.HasKey(u => u.Id);
            entity.Property(u => u.Content)
                 .IsRequired();

            entity.HasOne(u => u.Category)
                   .WithMany(at => at.Notes)
                   .HasForeignKey(at => at.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);




        }
        private void ConfigureUser(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.Username)
                                    .IsUnique();

                entity.Property(u => u.PasswordHash)
                    .IsRequired();

                // Créer un index unique sur Email
                entity.HasIndex(u => u.Email)
                    .IsUnique();
                    

                entity.HasMany(u => u.Categories)           
                    .WithOne(r => r.User)          
                    .HasForeignKey(u => u.UserId)    
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasMany(u => u.Summaries)
                       .WithOne(r => r.User)
                       .HasForeignKey(u => u.UserId)
                       .OnDelete(DeleteBehavior.Restrict);

            });
        }

        private void ConfigureFeed(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Feed>(entity =>
            {

                entity.HasKey(u => u.Id);
                entity.Property(u => u.URL)
                     .IsRequired();

                entity.HasOne(u => u.Category)
                       .WithMany(at => at.Feeds)
                       .HasForeignKey(at => at.CategoryId)
                        .OnDelete(DeleteBehavior.Restrict);
            });
        }
        private void ConfigureSummary(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Summary>(entity =>
            {

                entity.HasKey(u => u.Id);
                entity.Property(u => u.Content)
                     .IsRequired();

                entity.HasOne(u => u.Trend)
                       .WithMany(at => at.Summaries)
                       .HasForeignKey(at => at.TrendId)
                        .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(u => u.User)
                      .WithMany(at => at.Summaries)
                      .HasForeignKey(at => at.UserId)
                       .OnDelete(DeleteBehavior.Restrict);

                // Sans navigation inverse : Category n'expose pas de collection de
                // Summaries, et en ajouter une obligerait a la charger partout ou
                // une categorie est lue.
                entity.HasOne(u => u.Category)
                      .WithMany()
                      .HasForeignKey(at => at.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }



        /// <summary>
        /// Date de creation des lignes de reference.
        /// </summary>
        /// <remarks>
        /// Valeur figee, et non DateTime.UtcNow : HasData fait partie du modele.
        /// Avec un appel dynamique, le modele differe a chaque construction, EF
        /// leve PendingModelChangesWarning et Database.Migrate() refuse de
        /// demarrer l'application. C'est aussi ce qui faisait re-timbrer ces
        /// memes CreatedAt par chaque migration ajoutee au depot.
        ///
        /// La date n'a pas de sens metier : ces lignes sont livrees avec le
        /// schema, elles n'ont pas ete creees par quelqu'un a un instant donne.
        /// </remarks>
        private static readonly DateTime SeedCreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Insérer des catégories par défaut
            modelBuilder.Entity<Category>().HasData(
                    new Category
                    {
                        Id = 1,
                        Name = "Tech News",
                        CreatedAt = SeedCreatedAt,
                        UserId = null // null = global / non assigné à un utilisateur spécifique
                    },
                    new Category
                    {
                        Id = 2,
                        Name = "Artificial Intelligence",
                        CreatedAt = SeedCreatedAt,
                        UserId = null
                    },
                    new Category
                    {
                        Id = 3,
                        Name = "C# / .NET",
                        CreatedAt = SeedCreatedAt,
                        UserId = null
                    },
                    new Category
                    {
                        Id = 4,
                        Name = "JavaScript & Web",
                        CreatedAt = SeedCreatedAt,
                        UserId = null
                    },
                    new Category
                    {
                        Id = 5,
                        Name = "Cybersecurity",
                        CreatedAt = SeedCreatedAt,
                        UserId = null
                    }
);

            modelBuilder.Entity<Feed>().HasData(
                     new Feed
                     {
                         Id = 1,
                         URL = "https://hnrss.org/frontpage",
                         Name = "Hacker News Frontpage",
                         CategoryId = 1,            // Catégorie : Général / High-Tech
                         CreatedAt = SeedCreatedAt
                     },
                     new Feed
                     {
                         Id = 2,
                         URL = "https://www.theverge.com/rss/index.xml",
                         Name = "The Verge",
                         CategoryId = 1,            // Général tech
                         CreatedAt = SeedCreatedAt
                     },
                     new Feed
                     {
                         Id = 3,
                         URL = "https://www.technologyreview.com/topnews.rss",
                         Name = "MIT Technology Review",
                         CategoryId = 1,
                         CreatedAt = SeedCreatedAt
                     },

                     // === AI ===
                     new Feed
                     {
                         Id = 4,
                         URL = "https://www.reddit.com/r/MachineLearning/.rss",
                         Name = "Reddit Machine Learning",
                         CategoryId = 2,            // IA / ML
                         CreatedAt = SeedCreatedAt
                     },
                     new Feed
                     {
                         Id = 5,
                         URL = "https://ai.googleblog.com/atom.xml",
                         Name = "Google AI Blog",
                         CategoryId = 2,
                         CreatedAt = SeedCreatedAt
                     },
                     new Feed
                     {
                         Id = 6,
                         URL = "https://openai.com/blog/rss.xml",
                         Name = "OpenAI Blog",
                         CategoryId = 2,
                         CreatedAt = SeedCreatedAt
                     },

                     // === C# / .NET ===
                     new Feed
                     {
                         Id = 7,
                         URL = "https://devblogs.microsoft.com/dotnet/feed/",
                         Name = "Microsoft .NET Blog",
                         CategoryId = 3,            // C# / .NET
                         CreatedAt = SeedCreatedAt
                     },
                     new Feed
                     {
                         Id = 8,
                         URL = "https://weblog.asp.net/rss",
                         Name = "ASP.NET Weblog",
                         CategoryId = 3,
                         CreatedAt = SeedCreatedAt
                     },

                     // === JavaScript / Node / React ===
                     new Feed
                     {
                         Id = 9,
                         URL = "https://blog.bitsrc.io/feed",
                         Name = "Bits and Pieces",
                         CategoryId = 4,            // JS / Node / React
                         CreatedAt = SeedCreatedAt
                     },
                     new Feed
                     {
                         Id = 10,
                         URL = "https://nodejs.org/en/feed/blog.xml",
                         Name = "Node.js Blog",
                         CategoryId = 4,
                         CreatedAt = SeedCreatedAt
                     },
                     new Feed
                     {
                         Id = 11,
                         URL = "https://reactjs.org/feed.xml",
                         Name = "React Blog",
                         CategoryId = 4,
                         CreatedAt = SeedCreatedAt
                     },

                     // === Cybersecurity ===
                     new Feed
                     {
                         Id = 12,
                         URL = "https://krebsonsecurity.com/feed/",
                         Name = "Krebs on Security",
                         CategoryId = 5,            // Cyber
                         CreatedAt = SeedCreatedAt
                     },
                     new Feed
                     {
                         Id = 13,
                         URL = "https://www.darkreading.com/rss.xml",
                         Name = "Dark Reading",
                         CategoryId = 5,
                         CreatedAt = SeedCreatedAt
                     }
            );


        }
    }
}
