using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PulseWatch.API.Migrations
{
    /// <inheritdoc />
    public partial class update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    RefreshToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefreshTokenExpiryTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Categories_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Feeds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    URL = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Feeds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Feeds_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Feeds_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Notes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notes_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Trends",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GeneratedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Score = table.Column<double>(type: "float", nullable: true),
                    Data = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trends", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Trends_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Summaries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", maxLength: 5000, nullable: false),
                    GeneratedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TrendId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Summaries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Summaries_Trends_TrendId",
                        column: x => x.TrendId,
                        principalTable: "Trends",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Summaries_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Color", "CreatedAt", "Name", "UserId" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2026, 1, 26, 13, 45, 31, 459, DateTimeKind.Utc).AddTicks(9854), "Tech News", null },
                    { 2, null, new DateTime(2026, 1, 26, 13, 45, 31, 461, DateTimeKind.Utc).AddTicks(2389), "Artificial Intelligence", null },
                    { 3, null, new DateTime(2026, 1, 26, 13, 45, 31, 461, DateTimeKind.Utc).AddTicks(2397), "C# / .NET", null },
                    { 4, null, new DateTime(2026, 1, 26, 13, 45, 31, 461, DateTimeKind.Utc).AddTicks(2402), "JavaScript & Web", null },
                    { 5, null, new DateTime(2026, 1, 26, 13, 45, 31, 461, DateTimeKind.Utc).AddTicks(2407), "Cybersecurity", null }
                });

            migrationBuilder.InsertData(
                table: "Feeds",
                columns: new[] { "Id", "CategoryId", "CreatedAt", "IsActive", "Name", "URL", "UserId" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 1, 26, 13, 45, 31, 466, DateTimeKind.Utc).AddTicks(5404), true, "Hacker News Frontpage", "https://hnrss.org/frontpage", null },
                    { 2, 1, new DateTime(2026, 1, 26, 13, 45, 31, 466, DateTimeKind.Utc).AddTicks(6646), true, "The Verge", "https://www.theverge.com/rss/index.xml", null },
                    { 3, 1, new DateTime(2026, 1, 26, 13, 45, 31, 466, DateTimeKind.Utc).AddTicks(6654), true, "MIT Technology Review", "https://www.technologyreview.com/topnews.rss", null },
                    { 4, 2, new DateTime(2026, 1, 26, 13, 45, 31, 466, DateTimeKind.Utc).AddTicks(6659), true, "Reddit Machine Learning", "https://www.reddit.com/r/MachineLearning/.rss", null },
                    { 5, 2, new DateTime(2026, 1, 26, 13, 45, 31, 466, DateTimeKind.Utc).AddTicks(6664), true, "Google AI Blog", "https://ai.googleblog.com/atom.xml", null },
                    { 6, 2, new DateTime(2026, 1, 26, 13, 45, 31, 466, DateTimeKind.Utc).AddTicks(6668), true, "OpenAI Blog", "https://openai.com/blog/rss.xml", null },
                    { 7, 3, new DateTime(2026, 1, 26, 13, 45, 31, 466, DateTimeKind.Utc).AddTicks(6673), true, "Microsoft .NET Blog", "https://devblogs.microsoft.com/dotnet/feed/", null },
                    { 8, 3, new DateTime(2026, 1, 26, 13, 45, 31, 466, DateTimeKind.Utc).AddTicks(6678), true, "ASP.NET Weblog", "https://weblog.asp.net/rss", null },
                    { 9, 4, new DateTime(2026, 1, 26, 13, 45, 31, 466, DateTimeKind.Utc).AddTicks(6683), true, "Bits and Pieces", "https://blog.bitsrc.io/feed", null },
                    { 10, 4, new DateTime(2026, 1, 26, 13, 45, 31, 466, DateTimeKind.Utc).AddTicks(6688), true, "Node.js Blog", "https://nodejs.org/en/feed/blog.xml", null },
                    { 11, 4, new DateTime(2026, 1, 26, 13, 45, 31, 466, DateTimeKind.Utc).AddTicks(6693), true, "React Blog", "https://reactjs.org/feed.xml", null },
                    { 12, 5, new DateTime(2026, 1, 26, 13, 45, 31, 466, DateTimeKind.Utc).AddTicks(6697), true, "Krebs on Security", "https://krebsonsecurity.com/feed/", null },
                    { 13, 5, new DateTime(2026, 1, 26, 13, 45, 31, 466, DateTimeKind.Utc).AddTicks(6702), true, "Dark Reading", "https://www.darkreading.com/rss.xml", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_UserId",
                table: "Categories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Feeds_CategoryId",
                table: "Feeds",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Feeds_UserId",
                table: "Feeds",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_CategoryId",
                table: "Notes",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_UserId",
                table: "Notes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Summaries_TrendId",
                table: "Summaries",
                column: "TrendId");

            migrationBuilder.CreateIndex(
                name: "IX_Summaries_UserId",
                table: "Summaries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Trends_CategoryId",
                table: "Trends",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Feeds");

            migrationBuilder.DropTable(
                name: "Notes");

            migrationBuilder.DropTable(
                name: "Summaries");

            migrationBuilder.DropTable(
                name: "Trends");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
