using System.ComponentModel.DataAnnotations;

namespace PulseWatch.Core.DTOs.Request
{
    /// <summary>
    /// DTO for creating a new RSS feed
    /// </summary>
    public class CreateFeedDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Url]
        [StringLength(500)]
        public string Url { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        public int CategoryId { get; set; }

        public bool IsActive { get; set; } = true;

        public int? RefreshIntervalMinutes { get; set; } = 60;
    }
}
