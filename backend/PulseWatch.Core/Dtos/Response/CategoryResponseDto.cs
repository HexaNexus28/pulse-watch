using System;

namespace PulseWatch.Core.Dtos.Response
{
    /// <summary>
    /// DTO pour la réponse de catégorie
    /// </summary>
    public class CategoryResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UserId { get; set; }
        public int FeedCount { get; set; }
        public int NoteCount { get; set; }
        public int TrendCount { get; set; }
    }
}
