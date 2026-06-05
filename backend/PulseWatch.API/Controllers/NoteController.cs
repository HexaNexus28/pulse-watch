using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseWatch.API.Helpers;
using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Dtos.Response;
using PulseWatch.Core.Interfaces.Services;

namespace PulseWatch.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NoteController : ControllerBase
    {
        private readonly INoteService _noteService;

        public NoteController(INoteService noteService)
        {
            _noteService = noteService ?? throw new ArgumentNullException(nameof(noteService));
        }

        [HttpGet]
        public async Task<IActionResult> GetAllNotes()
        {
            var result = await _noteService.GetAllNotesAsync();
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetNoteById(int id)
        {
            var result = await _noteService.GetNoteByIdAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateNote([FromBody] CreateNoteDto createNoteDto)
        {
            var result = await _noteService.CreateNoteAsync(createNoteDto);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(int id, [FromBody] UpdateNoteDto updateNoteDto)
        {
            var result = await _noteService.UpdateNoteAsync(id, updateNoteDto);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var result = await _noteService.DeleteNoteAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        private int GetCurrentUserId()
        {
            var userId = UserHelper.GetCurrentUserId(this);
            return userId ?? 0;
        }
    }
}
