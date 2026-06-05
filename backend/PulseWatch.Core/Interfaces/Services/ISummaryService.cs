using PulseWatch.Core.Dtos.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Interfaces.Services
{
   public interface ISummaryService
    { 
        /// <summary>
      /// Récupère un résumé par ID
      /// </summary>
        Task<ApiResponse<SummaryResponseDto>> GetSummaryByIdAsync(int id);

        /// <summary>
        /// Récupère tous les résumés
        /// </summary>
        Task<ApiResponse<IEnumerable<SummaryResponseDto>>> GetAllSummariesAsync();

        /// <summary>
        /// Génère un résumé à partir d'un trend donné
        /// </summary>
        Task<ApiResponse<SummaryResponseDto>> GenerateSummaryAsync(int trendId, int userId);

        /// <summary>
        /// Récupère les résumés d'un utilisateur
        /// </summary>
        Task<ApiResponse<IEnumerable<SummaryResponseDto>>> GetUserSummariesAsync(int userId);

        /// <summary>
        /// Supprime un summary
        /// </summary>
        Task<ApiResponse<bool>> DeleteSummaryAsync(int id);

        /// <summary>
        /// Récupère les résumés récents pour un utilisateur
        /// </summary>
        Task<ApiResponse<IEnumerable<SummaryResponseDto>>> GetRecentByUserAsync(int userId, int limit);

        // Méthodes supplémentaires pour le controller
        /// <summary>
        /// Récupère les résumés d'un utilisateur (alias pour GetUserSummariesAsync)
        /// </summary>
        Task<ApiResponse<IEnumerable<SummaryResponseDto>>> GetSummariesByUserAsync(int userId);

        /// <summary>
        /// Récupère les résumés du jour
        /// </summary>
        Task<ApiResponse<IEnumerable<SummaryResponseDto>>> GetDailySummariesAsync();

        /// <summary>
        /// Récupère les résumés par catégorie
        /// </summary>
        Task<ApiResponse<IEnumerable<SummaryResponseDto>>> GetSummariesByCategoryAsync(int categoryId);

        /// <summary>
        /// Génère un résumé pour une catégorie
        /// </summary>
        Task<ApiResponse<SummaryResponseDto>> GenerateSummaryForCategoryAsync(int categoryId, int userId);
    }

}
