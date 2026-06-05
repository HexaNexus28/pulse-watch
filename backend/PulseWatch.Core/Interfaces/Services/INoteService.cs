using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Dtos.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Interfaces.Services
{
    public interface INoteService
    {
        /// <summary>
        /// Récupère une note par ID
        /// </summary>
        Task<ApiResponse<NoteResponseDto>> GetNoteByIdAsync(int id);

        /// <summary>
        /// Récupère toutes les notes
        /// </summary>
        Task<ApiResponse<IEnumerable<NoteResponseDto>>> GetAllNotesAsync();

        /// <summary>
        /// Crée une nouvelle note
        /// </summary>
        Task<ApiResponse<NoteResponseDto>> CreateNoteAsync(CreateNoteDto dto);

        /// <summary>
        /// Met à jour une note existante
        /// </summary>
        Task<ApiResponse<NoteResponseDto>> UpdateNoteAsync(int id, UpdateNoteDto dto);

        /// <summary>
        /// Supprime une note
        /// </summary>
        Task<ApiResponse<bool>> DeleteNoteAsync(int id);

        /// <summary>
        /// Récupère le nombre de notes pour un utilisateur
        /// </summary>
        Task<int> GetCountByUserAsync(int userId);

        /// <summary>
        /// Récupère les notes récentes pour un utilisateur
        /// </summary>
        Task<IEnumerable<dynamic>> GetRecentByUserAsync(int userId, int limit);
    }
}
