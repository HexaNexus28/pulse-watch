using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PulseWatch.Core.Entities
{
    [Table("Trends")]
    public class Trend
    {
        #region Base Properties
        [Key]
        [Required]
        public int Id { get; set; }

        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// Score global du trend (moyenne des valeurs)
        /// </summary>
        public double? Score { get; set; }
        #endregion

        #region Trend Data (JSON-like Dictionary)
        /// <summary>
        /// Exemple :
        /// {
        ///   "AI": 0.92,
        ///   "DevOps": 0.66,
        ///   "Node.js": 0.47
        /// }
        /// </summary>
        public Dictionary<string, double> Data { get; set; } = new Dictionary<string, double>();
        #endregion

        #region Foreign Keys
        public int CategoryId { get; set; }


        [ForeignKey(nameof(CategoryId))]
        public virtual Category Category { get; set; } = null!;

        public virtual ICollection<Summary> Summaries { get; set; } = new List<Summary>();
        #endregion
    }
}
