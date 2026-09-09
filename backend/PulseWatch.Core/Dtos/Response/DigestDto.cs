using System.Text.Json.Serialization;

namespace PulseWatch.Core.Dtos.Response
{
    /// <summary>
    /// Sortie de l'agent. Les noms JSON sont en snake_case parce que le contrat
    /// est défini côté Python (digest_agent/schemas.py) : on s'aligne dessus
    /// plutôt que d'imposer une casse .NET à un service qui ne la connaît pas.
    /// </summary>
    public class DigestItemDto
    {
        [JsonPropertyName("headline")]
        public string Headline { get; set; } = string.Empty;

        [JsonPropertyName("why_it_matters")]
        public string WhyItMatters { get; set; } = string.Empty;

        [JsonPropertyName("sources")]
        public List<string> Sources { get; set; } = new();
    }

    public class DigestDto
    {
        [JsonPropertyName("category")]
        public string Category { get; set; } = string.Empty;

        [JsonPropertyName("items")]
        public List<DigestItemDto> Items { get; set; } = new();

        /// <summary>
        /// Nombre d'articles écartés comme doublons ou bruit. C'est la preuve
        /// mesurable que l'agent a filtré — l'ancien code n'écartait rien.
        /// </summary>
        [JsonPropertyName("dropped_count")]
        public int DroppedCount { get; set; }
    }
}
