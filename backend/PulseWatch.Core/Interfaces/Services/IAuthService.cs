using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Dtos.Response;
using System.Threading.Tasks;

namespace PulseWatch.Core.Interfaces.Services
{
    /// <summary>
    /// Interface pour le service d'authentification
    /// Gère l'authentification des utilisateurs en utilisant l'architecture Unit of Work
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Authentifie un utilisateur et retourne un token JWT
        /// </summary>
        Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto loginRequest);

        /// <summary>
        /// Enregistre un nouvel utilisateur
        /// </summary>
        Task<ApiResponse<LoginResponseDto>> RegisterAsync(RegisterRequestDto registerRequest);

        /// <summary>
        /// Rafraîchit un token JWT
        /// </summary>
        Task<ApiResponse<LoginResponseDto>> RefreshTokenAsync(string refreshToken);

        /// <summary>
        /// Déconnecte un utilisateur
        /// </summary>
        Task<ApiResponse<bool>> LogoutAsync(string refreshToken);

        /// <summary>
        /// Valide un token JWT
        /// </summary>
        Task<ApiResponse<bool>> ValidateTokenAsync(string token);
    }
}
