using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Dtos.Response;

namespace PulseWatch.Core.Interfaces.Services
{
    /// <summary>
    /// Abstraction du service de digest. L'implémentation appelle l'agent ADK en
    /// HTTP, mais la couche Business ne le sait pas : elle dépend de cette
    /// interface, ce qui permet de tester SummaryService sans réseau.
    /// </summary>
    public interface IDigestGenerator
    {
        Task<DigestDto> GenerateAsync(
            string category,
            IReadOnlyList<DigestArticleDto> articles,
            CancellationToken cancellationToken = default);
    }
}
