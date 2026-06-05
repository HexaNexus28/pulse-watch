using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Dtos.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Interfaces.Services
{
   public interface IFeedService
    {
        /// <summary>
        /// Récupère un flux par ID
        /// </summary>
        Task<ApiResponse<FeedResponseDto>> GetFeedByIdAsync(int id);

        /// <summary>
        /// Récupère tous les flux
        /// </summary>
        Task<ApiResponse<IEnumerable<FeedResponseDto>>> GetAllFeedsAsync();

        /// <summary>
        /// Ajoute un flux RSS
        /// </summary>
        Task<ApiResponse<FeedResponseDto>> AddFeedAsync(CreateFeedDto dto);

        /// <summary>
        /// Supprime un flux RSS
        /// </summary>
        Task<ApiResponse<bool>> DeleteFeedAsync(int id);

        /// <summary>
        /// Récupère et parse le contenu d'un flux RSS
        /// </summary>
        Task<ApiResponse<IEnumerable<FeedContentDto>>> FetchFeedContentAsync(int feedId);

        /// <summary>
        /// Récupère tous les feeds d'une catégorie
        /// </summary>
        Task<ApiResponse<IEnumerable<FeedResponseDto>>> GetFeedsByCategoryAsync(int categoryId);

        /// <summary>
        /// Récupère le nombre de feeds actifs pour un utilisateur
        /// </summary>
        Task<ApiResponse<int>> GetActiveCountByUserAsync(int userId);

        /// <summary>
        /// Récupère les feeds récents pour un utilisateur
        /// </summary>
        Task<ApiResponse<IEnumerable<FeedResponseDto>>> GetRecentByUserAsync(int userId, int limit);
    }
}
