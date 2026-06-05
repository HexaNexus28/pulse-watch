using PulseWatch.Core.Dtos.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Interfaces.Services
{
   public interface ITrendService
    {
        /// <summary>
        /// Récupère un trend par ID
        /// </summary>
        Task<ApiResponse<TrendResponseDto>> GetTrendByIdAsync(int id);

        /// <summary>
        /// Récupère tous les trends
        /// </summary>
        Task<ApiResponse<IEnumerable<TrendResponseDto>>> GetAllTrendsAsync();

        /// <summary>
        /// Analyse automatiquement les données RSS et génère des trends
        /// </summary>
        Task<ApiResponse<IEnumerable<TrendResponseDto>>> DetectTrendsAsync(int categoryId);

        /// <summary>
        /// Récupère les trends récents filtrés par catégorie
        /// </summary>
        Task<ApiResponse<IReadOnlyList<TrendResponseDto>>> GetTrendsByCategoryAsync(int categoryId);

        /// <summary>
        /// Récupère le score d'analyse de trend le plus récent pour un utilisateur
        /// </summary>
        Task<ApiResponse<TrendResponseDto>> GetLatestAnalysisScoreAsync(int categoryId);

        /// <summary>
        /// Récupère les trends récents pour un utilisateur
        /// </summary>
        Task<ApiResponse<IEnumerable<TrendResponseDto>>> GetRecentByUserAsync(int userId, int limit);

        /// <summary>
        /// Récupère le trend le plus récent pour une catégorie
        /// </summary>
        Task<ApiResponse<TrendResponseDto>> GetLatestTrendByCategoryAsync(int categoryId);

        /// <summary>
        /// Génère un trend pour une catégorie
        /// </summary>
        Task<ApiResponse<TrendResponseDto>> GenerateTrendForCategoryAsync(int categoryId);
    }
}
