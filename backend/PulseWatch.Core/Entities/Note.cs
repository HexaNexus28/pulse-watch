using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PulseWatch.Core.Entities
{
    [Table("Notes")]
    public class Note
    {
        #region Base Properties
        [Key]
        [Required]
        public int Id { get; set; }

        [Required]
        [StringLength(120)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        #endregion

        #region Foreign Keys
        public int CategoryId { get; set; }
        public int UserId { get; set; }

        [ForeignKey(nameof(CategoryId))]
        public virtual Category Category { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }
        #endregion
    }
}
