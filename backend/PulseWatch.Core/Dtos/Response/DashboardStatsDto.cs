namespace PulseWatch.Core.Dtos.Response
{
    /// <summary>
    /// DTO for dashboard statistics
    /// </summary>
    public class DashboardStatsDto
    {
        /// <summary>
        /// Total number of categories for the user
        /// </summary>
        public int TotalCategories { get; set; }

        /// <summary>
        /// Number of active feeds
        /// </summary>
        public int ActiveFeeds { get; set; }

        /// <summary>
        /// Total number of notes
        /// </summary>
        public int TotalNotes { get; set; }

        /// <summary>
        /// Trend analysis score (percentage)
        /// </summary>
        public int TrendAnalysis { get; set; }

        /// <summary>
        /// Change in categories count from last period
        /// </summary>
        public string CategoriesChange { get; set; } = string.Empty;

        /// <summary>
        /// Change in feeds count from last period
        /// </summary>
        public string FeedsChange { get; set; } = string.Empty;

        /// <summary>
        /// Change in notes count from last period
        /// </summary>
        public string NotesChange { get; set; } = string.Empty;

        /// <summary>
        /// Change in trend analysis from last period
        /// </summary>
        public string TrendsChange { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for recent activity items
    /// </summary>
    public class ActivityDto
    {
        /// <summary>
        /// Activity ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Type of activity (note, feed, trend, summary)
        /// </summary>
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// Activity title/description
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Formatted timestamp
        /// </summary>
        public string Timestamp { get; set; } = string.Empty;

        /// <summary>
        /// Category name
        /// </summary>
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// Category ID (optional)
        /// </summary>
        public int? CategoryId { get; set; }
    }

    /// <summary>
    /// DTO for category statistics
    /// </summary>
    public class CategoryStatsDto
    {
        /// <summary>
        /// Category ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Category name
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Total items count (feeds + notes)
        /// </summary>
        public int Count { get; set; }

        /// <summary>
        /// Trend percentage
        /// </summary>
        public string Trend { get; set; } = string.Empty;

        /// <summary>
        /// Category color (optional)
        /// </summary>
        public string? Color { get; set; }
    }
}
