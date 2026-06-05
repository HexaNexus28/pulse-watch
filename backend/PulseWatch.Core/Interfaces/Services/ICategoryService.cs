using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Dtos.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Interfaces.Services
{
    public interface ICategoryService
    {/// <summary>
     /// Récupère une catégorie par ID
     /// </summary>
        Task<ApiResponse<CategoryResponseDto>> GetCategoryByIdAsync(int id);

        /// <summary>
        /// Récupère toutes les catégories
        /// </summary>
        Task<ApiResponse<IEnumerable<CategoryResponseDto>>> GetAllCategoriesAsync();

        /// <summary>
        /// Crée une nouvelle catégorie
        /// </summary>
        Task<ApiResponse<CategoryResponseDto>> CreateCategoryAsync(CreateCategoryDto dto);

        /// <summary>
        /// Met à jour une catégorie existante
        /// </summary>
        Task<ApiResponse<CategoryResponseDto>> UpdateCategoryAsync(int id, UpdateCategoryDto dto);

        /// <summary>
        /// Supprime une catégorie
        /// </summary>
        Task<ApiResponse<bool>> DeleteCategoryAsync(int id);

        /// <summary>
        /// Récupère toutes les notes d'une catégorie
        /// </summary>
        Task<ApiResponse<IEnumerable<NoteResponseDto>>> GetCategoryNotesAsync(int categoryId);

        /// <summary>
        /// Récupère tous les feeds d'une catégorie
        /// </summary>
        Task<ApiResponse<IEnumerable<FeedResponseDto>>> GetCategoryFeedsAsync(int categoryId);

        /// <summary>
        /// Récupère tous les trends d'une catégorie
        /// </summary>
        Task<ApiResponse<IEnumerable<TrendResponseDto>>> GetCategoryTrendsAsync(int categoryId);

        /// <summary>
        /// Récupère le nombre de catégories pour un utilisateur
        /// </summary>
        Task<int> GetCountByUserAsync(int userId);

        /// <summary>
        /// Récupère les catégories les plus populaires pour un utilisateur
        /// </summary>
        Task<IEnumerable<dynamic>> GetTopCategoriesByUserAsync(int userId, int limit);
    }
}
