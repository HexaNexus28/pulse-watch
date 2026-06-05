using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseWatch.API.Helpers;
using PulseWatch.Core.Dtos.Response;
using PulseWatch.Core.Interfaces.Services;

namespace PulseWatch.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SummaryController : ControllerBase
    {
        private readonly ISummaryService _summaryService;

        public SummaryController(ISummaryService summaryService)
        {
            _summaryService = summaryService ?? throw new ArgumentNullException(nameof(summaryService));
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSummaries()
        {
            var result = await _summaryService.GetAllSummariesAsync();
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSummaryById(int id)
        {
            var result = await _summaryService.GetSummaryByIdAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetSummariesByUser(int userId)
        {
            var result = await _summaryService.GetSummariesByUserAsync(userId);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("daily")]
        public async Task<IActionResult> GetDailySummaries()
        {
            var result = await _summaryService.GetDailySummariesAsync();
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetSummariesByCategory(int categoryId)
        {
            var result = await _summaryService.GetSummariesByCategoryAsync(categoryId);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpPost("trend/{trendId}/generate")]
        public async Task<IActionResult> GenerateSummaryFromTrend(int trendId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized("User not authenticated");

            var result = await _summaryService.GenerateSummaryAsync(trendId, userId);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpPost("category/{categoryId}/generate")]
        public async Task<IActionResult> GenerateSummaryForCategory(int categoryId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized("User not authenticated");

            var result = await _summaryService.GenerateSummaryForCategoryAsync(categoryId, userId);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        private int GetCurrentUserId()
        {
            var userId = UserHelper.GetCurrentUserId(this);
            return userId ?? 0;
        }
    }
}
