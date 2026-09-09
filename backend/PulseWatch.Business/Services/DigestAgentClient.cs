using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Dtos.Response;
using PulseWatch.Core.Interfaces.Services;

namespace PulseWatch.Business.Services
{
    /// <summary>
    /// Client HTTP de l'agent ADK. Typed client : l'URL de base vient de la
    /// configuration (DigestAgent:BaseUrl), jamais du code [R-02].
    /// </summary>
    public class DigestAgentClient : IDigestGenerator
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<DigestAgentClient> _logger;

        public DigestAgentClient(HttpClient httpClient, ILogger<DigestAgentClient> logger)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<DigestDto> GenerateAsync(
            string category,
            IReadOnlyList<DigestArticleDto> articles,
            CancellationToken cancellationToken = default)
        {
            var payload = new { category, articles };

            var response = await _httpClient.PostAsJsonAsync("/digest", payload, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Digest agent returned {Status}: {Body}", (int)response.StatusCode, body);
                throw new HttpRequestException(
                    $"Digest agent returned {(int)response.StatusCode}");
            }

            var digest = await response.Content.ReadFromJsonAsync<DigestDto>(cancellationToken);

            // Un 200 sans corps exploitable est une panne du service, pas un cas
            // métier : on ne fabrique pas un digest vide qui masquerait le problème.
            return digest ?? throw new HttpRequestException("Digest agent returned an empty body");
        }
    }
}
