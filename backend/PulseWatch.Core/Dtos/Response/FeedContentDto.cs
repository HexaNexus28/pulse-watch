using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Dtos.Response
{
    public class FeedContentDto
    {
        public string Title { get; set; } = string.Empty;      // Titre de l'article
        public string Link { get; set; } = string.Empty;       // Lien vers l'article
        public DateTime PublishedAt { get; set; }              // Date de publication
        public string Description { get; set; } = string.Empty; // Résumé (optionnel)
    }

}
