using PulseWatch.Core.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PulseWatch.Core.Entities
{
    [Table("Summaries")]
    public class Summary
    {
        #region Base Properties

        [Key]
        [Required]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(5000)]
        public string Content { get; set; } = string.Empty;

        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

        #endregion

        #region Foreign Keys

        // Nullable : un digest de categorie n'est rattache a aucun trend.
        public int? TrendId { get; set; }

        [ForeignKey(nameof(TrendId))]
        public virtual Trend? Trend { get; set; }

        // Optionnel : résumé généré pour un user particulier
        public int? UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }

        #endregion
    }
}
