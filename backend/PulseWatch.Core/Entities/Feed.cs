using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PulseWatch.Core.Entities
{
    [Table("Feeds")]
    public class Feed
    {
        #region Base Properties
        [Key]
        [Required]
        public int Id { get; set; }

        [Required]
        [StringLength(300)]
        public string URL { get; set; } = string.Empty;

        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        #endregion

        #region Foreign Keys
        public int CategoryId { get; set; }
        public int? UserId { get; set; }
        public bool IsActive { get; set; } = true;

        [ForeignKey(nameof(CategoryId))]
        public virtual Category Category { get; set; } = null!;
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
        #endregion
    }
}
