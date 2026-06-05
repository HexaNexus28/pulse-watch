using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PulseWatch.API.Helpers
{
    public static class UserHelper
    {
        /// <summary>
        /// Récupère l'ID de l'utilisateur courant depuis les claims JWT
        /// </summary>
        /// <param name="controller">Controller depuis lequel récupérer l'utilisateur</param>
        /// <returns>ID de l'utilisateur ou null si non trouvé</returns>
        public static int? GetCurrentUserId(ControllerBase controller)
        {
            var userIdClaim = controller.User.FindFirst(ClaimTypes.NameIdentifier);
            
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            
            return null;
        }

        /// <summary>
        /// Récupère l'email de l'utilisateur courant depuis les claims JWT
        /// </summary>
        /// <param name="controller">Controller depuis lequel récupérer l'utilisateur</param>
        /// <returns>Email de l'utilisateur ou null si non trouvé</returns>
        public static string? GetCurrentUserEmail(ControllerBase controller)
        {
            return controller.User.FindFirst(ClaimTypes.Email)?.Value;
        }

        /// <summary>
        /// Récupère le nom d'utilisateur courant depuis les claims JWT
        /// </summary>
        /// <param name="controller">Controller depuis lequel récupérer l'utilisateur</param>
        /// <returns>Nom d'utilisateur ou null si non trouvé</returns>
        public static string? GetCurrentUsername(ControllerBase controller)
        {
            return controller.User.FindFirst(ClaimTypes.Name)?.Value;
        }

        /// <summary>
        /// Vérifie si l'utilisateur courant est authentifié
        /// </summary>
        /// <param name="controller">Controller à vérifier</param>
        /// <returns>True si authentifié, false sinon</returns>
        public static bool IsCurrentUserAuthenticated(ControllerBase controller)
        {
            return controller.User?.Identity?.IsAuthenticated ?? false;
        }
    }
}
