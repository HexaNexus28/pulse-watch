using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Dtos.Response
{
  public class SummaryResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        /// <summary>Null pour un digest de categorie, qui n'est rattache a aucun trend.</summary>
        public int? TrendId { get; set; }
        public string TrendKeyword { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }

        /// <summary>Auteur du resume. Nullable : un digest peut etre genere par le cron, sans utilisateur.</summary>
        public int? UserId { get; set; }

        /// <summary>Categorie couverte. Denormalise ici pour eviter un aller-retour cote frontend.</summary>
        public string CategoryName { get; set; } = string.Empty;

    }
}
