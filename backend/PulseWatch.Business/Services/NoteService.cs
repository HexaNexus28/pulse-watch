using AutoMapper;
using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Dtos.Response;
using PulseWatch.Core.Entities;
using PulseWatch.Core.Interfaces.Repositories;
using PulseWatch.Core.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PulseWatch.Business.Services
{
    /// <summary>
    /// Implémentation du service de notes
    /// Utilise IUnitOfWork pour accéder aux repositories
    /// </summary>
    public class NoteService : INoteService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public NoteService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<ApiResponse<NoteResponseDto>> GetNoteByIdAsync(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return ApiResponse<NoteResponseDto>.ErrorResponse(
                        "Invalid Note ID", 400);
                }

                var note = await _unitOfWork.Notes.GetByIdAsync(id);

                if (note == null)
                {
                    return ApiResponse<NoteResponseDto>.NotFoundResponse(
                        $"Note with ID {id} not found");
                }

                var noteDto = _mapper.Map<NoteResponseDto>(note);
                return ApiResponse<NoteResponseDto>.SuccessResponse(
                    noteDto,
                    "Note retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<NoteResponseDto>.ErrorResponse(
                    $"An error occurred while retrieving note: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<IEnumerable<NoteResponseDto>>> GetAllNotesAsync()
        {
            try
            {
                var notes = await _unitOfWork.Notes.GetAllAsync();
                var noteDtos = _mapper.Map<IEnumerable<NoteResponseDto>>(notes);
                
                return ApiResponse<IEnumerable<NoteResponseDto>>.SuccessResponse(
                    noteDtos,
                    "Notes retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<NoteResponseDto>>.ErrorResponse(
                    $"An error occurred while retrieving notes: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<NoteResponseDto>> CreateNoteAsync(CreateNoteDto createNoteDto)
        {
            try
            {
                if (createNoteDto == null || string.IsNullOrWhiteSpace(createNoteDto.Title) || 
                    string.IsNullOrWhiteSpace(createNoteDto.Content))
                {
                    return ApiResponse<NoteResponseDto>.ErrorResponse(
                        "Invalid note data", 400);
                }

                var note = _mapper.Map<Note>(createNoteDto);
                var createdNote = await _unitOfWork.Notes.AddAsync(note);
                await _unitOfWork.SaveChangesAsync();

                var noteDto = _mapper.Map<NoteResponseDto>(createdNote);
                return ApiResponse<NoteResponseDto>.SuccessResponse(
                    noteDto,
                    "Note created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<NoteResponseDto>.ErrorResponse(
                    $"An error occurred while creating note: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<NoteResponseDto>> UpdateNoteAsync(int id, UpdateNoteDto updateNoteDto)
        {
            try
            {
                if (id <= 0)
                {
                    return ApiResponse<NoteResponseDto>.ErrorResponse(
                        "Invalid Note ID", 400);
                }

                var existingNote = await _unitOfWork.Notes.GetByIdAsync(id);
                if (existingNote == null)
                {
                    return ApiResponse<NoteResponseDto>.NotFoundResponse(
                        $"Note with ID {id} not found");
                }

                _mapper.Map(updateNoteDto, existingNote);
                _unitOfWork.Notes.Update(existingNote);
                await _unitOfWork.SaveChangesAsync();

                var noteDto = _mapper.Map<NoteResponseDto>(existingNote);
                return ApiResponse<NoteResponseDto>.SuccessResponse(
                    noteDto,
                    "Note updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<NoteResponseDto>.ErrorResponse(
                    $"An error occurred while updating note: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<bool>> DeleteNoteAsync(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return ApiResponse<bool>.ErrorResponse(
                        "Invalid Note ID", 400);
                }

                var existingNote = await _unitOfWork.Notes.GetByIdAsync(id);
                if (existingNote == null)
                {
                    return ApiResponse<bool>.NotFoundResponse(
                        $"Note with ID {id} not found");
                }

                _unitOfWork.Notes.Remove(existingNote);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse<bool>.SuccessResponse(
                    true,
                    "Note deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResponse(
                    $"An error occurred while deleting note: {ex.Message}", 500);
            }
        }

        public async Task<int> GetCountByUserAsync(int userId)
        {
            // TODO: Implement user filtering when UserId is properly handled
            return await _unitOfWork.Notes.CountAsync();
        }

        public async Task<IEnumerable<dynamic>> GetRecentByUserAsync(int userId, int limit)
        {
            // TODO: Implement user filtering when UserId is properly handled
            var notes = await _unitOfWork.Notes.FindAsync(n => n.CreatedAt >= DateTime.UtcNow.AddDays(-30));
            return notes.Take(limit).Select(note => new
            {
                Id = note.Id,
                Title = note.Title,
                CreatedAt = note.CreatedAt,
                CategoryId = note.CategoryId,
                Category = note.Category?.Name ?? "Uncategorized"
            });
        }
    }
}
