using PulseWatch.Core.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PulseWatch.Core.Entities
{
    [Table("Categories")]
    public class Category
    {
        #region Base Properties
        [Key]
        [Required]
        public int Id { get; set; }

        [Required]
        [StringLength(80)]
        public string Name { get; set; } = string.Empty;

        public string? Color { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        #endregion

        #region Foreign Keys
        public int? UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
        #endregion

        #region Relations
        public virtual ICollection<Feed> Feeds { get; set; } = new List<Feed>();
        public virtual ICollection<Note> Notes { get; set; } = new List<Note>();
        public virtual ICollection<Trend> Trends { get; set; } = new List<Trend>();
        #endregion
    }
}
