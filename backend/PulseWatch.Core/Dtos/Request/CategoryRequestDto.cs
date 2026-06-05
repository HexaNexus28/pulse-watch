using System.ComponentModel.DataAnnotations;

namespace PulseWatch.Core.Dtos.Request
{
    /// <summary>
    /// DTO for creating a new category
    /// </summary>
    public class CreateCategoryDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(7)]
        public string? Color { get; set; } = "#3b82f6";
    }

    /// <summary>
    /// DTO for updating an existing category
    /// </summary>
    public class UpdateCategoryDto
    {
        [StringLength(100, MinimumLength = 2)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(7)]
        public string? Color { get; set; }
    }
}
