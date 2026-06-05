using System.ComponentModel.DataAnnotations;

namespace PulseWatch.Core.DTOs.Request
{
    /// <summary>
    /// DTO for creating a new note
    /// </summary>
    public class CreateNoteDto
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(10000, MinimumLength = 10)]
        public string Content { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Summary { get; set; }

        public int? CategoryId { get; set; }

        [StringLength(100)]
        public string? Tags { get; set; }
    }

    /// <summary>
    /// DTO for updating an existing note
    /// </summary>
    public class UpdateNoteDto
    {
        [StringLength(200, MinimumLength = 2)]
        public string? Title { get; set; }

        [StringLength(10000, MinimumLength = 10)]
        public string? Content { get; set; }

        [StringLength(1000)]
        public string? Summary { get; set; }

        public int? CategoryId { get; set; }

        [StringLength(100)]
        public string? Tags { get; set; }
    }
}
