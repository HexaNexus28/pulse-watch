using System;
using System.Collections.Generic;

namespace PulseWatch.Core.Dtos.Response
{
    /// <summary>
    /// DTO pour la réponse de trend
    /// </summary>
    public class TrendResponseDto
    {
        public int Id { get; set; }
        public DateTime GeneratedAt { get; set; }
        public double? Score { get; set; }

        /// <summary>
        /// Exemple :
        /// {
        ///   "AI": 0.92,
        ///   "DevOps": 0.66,
        ///   "Node.js": 0.47
        /// }
        /// </summary>
        public Dictionary<string, double> Data { get; set; } = new Dictionary<string, double>();

        public string CategoryName { get; set; } = string.Empty;
        public int CategoryId { get; set; }
    }
}
