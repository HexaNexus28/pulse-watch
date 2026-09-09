namespace PulseWatch.Core.Dtos.Request
{
    /// <summary>
    /// Un article brut envoyé à l'agent de digest. Volontairement plat : l'agent
    /// ne connaît ni la base ni les entités, il ne reçoit que du texte et des URL.
    /// </summary>
    public class DigestArticleDto
    {
        public string Title { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
    }
}
