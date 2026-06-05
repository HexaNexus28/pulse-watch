using PulseWatch.Core.Dtos.Response;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PulseWatch.Core.Interfaces.Services
{
    /// <summary>
    /// Interface pour le service de dashboard
    /// Centralise les opérations de dashboard en utilisant l'architecture Unit of Work
    /// </summary>
    public interface IDashboardService
    {
        /// <summary>
        /// Récupère les statistiques générales du dashboard pour un utilisateur
        /// </summary>
        Task<ApiResponse<DashboardStatsDto>> GetStatsAsync(int userId);

        /// <summary>
        /// Récupère l'activité récente pour un utilisateur
        /// </summary>
        Task<ApiResponse<IEnumerable<ActivityDto>>> GetRecentActivityAsync(int userId, int limit = 10);

        /// <summary>
        /// Récupère les catégories les plus populaires pour un utilisateur
        /// </summary>
        Task<ApiResponse<IEnumerable<CategoryStatsDto>>> GetTopCategoriesAsync(int userId, int limit = 10);

        /// <summary>
        /// Récupère les statistiques de la semaine précédente pour comparaison
        /// </summary>
        Task<DashboardStatsDto> GetLastWeekStatsAsync(int userId);
    }
}
