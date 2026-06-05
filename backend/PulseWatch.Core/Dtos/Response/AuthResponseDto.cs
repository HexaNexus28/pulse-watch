using System;

namespace PulseWatch.Core.Dtos.Response
{
    /// <summary>
    /// DTO pour la réponse d'authentification
    /// </summary>
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
        public UserResponseDto User { get; set; } = new();
    }
}
