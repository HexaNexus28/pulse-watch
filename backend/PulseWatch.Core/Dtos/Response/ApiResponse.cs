using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Dtos.Response
{
    /// <summary>
    /// Réponse API standardisée pour toutes les requêtes
    /// Utilise le pattern générique pour typer les données
    /// </summary>
    /// <typeparam name="T">Type des données retournées</typeparam>
    public class ApiResponse<T>
    {
        /// <summary>
        /// Indique si l'opération a réussi
        /// </summary>
        public bool Success { get; set; }
        /// <summary>
        /// Message descriptif du résultat
        /// </summary>
        public string Message { get; set; } = string.Empty;
        /// <summary>
        /// Les données retournées (null si erreur)
        /// </summary>
        public T? Data { get; set; }
        /// <summary>
        /// Liste des erreurs (vide si succès)
        /// </summary>
        public List<string> Errors { get; set; } = new();
        /// <summary>
        /// Détails des erreurs de validation par champ
        /// </summary>
        public Dictionary<string, List<string>> ValidationErrors
        {
            get; set;
        } = new();
        /// <summary>
        /// Code de statut HTTP
        /// </summary>
        public int StatusCode { get; set; }
        /// <summary>
        /// Timestamp de la réponse
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        /// <summary>
        /// ID de traçage pour le debugging
        /// </summary>
        public string TraceId { get; set; } =
       Guid.NewGuid().ToString();
        // Méthodes factory pour faciliter la création
        /// <summary>
        /// Crée une réponse de succès
        /// </summary>
        public static ApiResponse<T> SuccessResponse(T data, string
message = "Operation successful")
        {
            return new ApiResponse<T>
            {
                Success = true,
                StatusCode = 200,
                Message = message,
                Data = data
            };
        }
        /// <summary>
        /// Crée une réponse de création (201)
        /// </summary>
        public static ApiResponse<T> CreatedResponse(T data, string
       message = "Resource created successfully")
        {
            return new ApiResponse<T>
            {
                Success = true,
                StatusCode = 201,
                Message = message,
                Data = data
            };
        }
        /// <summary>
        /// Crée une réponse d'erreur
        /// </summary>
        public static ApiResponse<T> ErrorResponse(string message,
       int statusCode = 400, List<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = statusCode,
                Message = message,
                Errors = errors ?? new List<string>()
            };
        }
        /// <summary>
        /// Crée une réponse d'erreur de validation
        /// </summary>
        public static ApiResponse<T>ValidationErrorResponse(Dictionary<string, List<string>>
       validationErrors)
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = 422,
                Message = "Validation failed",
                ValidationErrors = validationErrors
            };
        }
        /// <summary>
        /// Crée une réponse Not Found
        /// </summary>
        public static ApiResponse<T> NotFoundResponse(string message
       = "Resource not found")
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = 404,
                Message = message
            };
        }
        /// <summary>
        /// Crée une réponse Unauthorized
        /// </summary>
        public static ApiResponse<T> UnauthorizedResponse(string
       message = "Unauthorized access")
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = 401,
                Message = message
            };
        }
    }
}
