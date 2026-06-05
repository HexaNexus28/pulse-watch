
using PulseWatch.Core.Dtos.Response;
using PulseWatch.Core.Dtos.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Interfaces.Services
{
    /// <summary>
    /// Interface pour les services utilisateur
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Enregistre un nouvel utilisateur
        /// </summary>
        Task<ApiResponse<UserResponseDto>> RegisterAsync(RegisterRequestDto registerDto);

        /// <summary>
        /// Authentifie un utilisateur
        /// </summary>
        Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto loginDto);

        /// <summary>
        /// Rafraîchit le token d'accès
        /// </summary>
        Task<ApiResponse<LoginResponseDto>> RefreshTokenAsync(string refreshToken);

        /// <summary>
        /// Déconnecte un utilisateur
        /// </summary>
        Task<ApiResponse<bool>> LogoutAsync(int userId);

        /// <summary>
        /// Récupère un utilisateur par ID
        /// </summary>
        Task<ApiResponse<UserResponseDto>> GetUserByIdAsync(int id);

        /// <summary>
        /// Récupère tous les utilisateurs
        /// </summary>
        Task<ApiResponse<IEnumerable<UserResponseDto>>> GetAllUsersAsync();

        /// <summary>
        /// Crée un nouvel utilisateur
        /// </summary>
       

        /// <summary>
        /// Met à jour un utilisateur existant
        /// </summary>
        Task<ApiResponse<UserResponseDto>> UpdateUserAsync(int id, UpdateUserDto updateUserDto);

        /// <summary>
        /// Supprime un utilisateur
        /// </summary>
        Task<ApiResponse<bool>> DeleteUserAsync(int id);

        /// <summary>
        /// Change le mot de passe d'un utilisateur
        /// </summary>
        Task<ApiResponse<bool>> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);

        /// <summary>
        /// Récupère toutes les catégories d'un utilisateur
        /// </summary>
        Task<ApiResponse<IEnumerable<CategoryResponseDto>>> GetUserCategoriesAsync(int userId);

        /// <summary>
        /// Vérifie si un email existe déjà
        /// </summary>
        Task<ApiResponse<bool>> CheckEmailExistsAsync (string email);
        Task<ApiResponse<bool>> CheckUsernameExistsAsync(string email);
        /// <summary>
        /// Vérifie si un nom d'utilisateur existe déjà
        /// </summary>
        Task<bool> UsernameExistsAsync(string username);
    }
}
