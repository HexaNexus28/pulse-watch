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
    public class TrendController : ControllerBase
    {
        private readonly ITrendService _trendService;

        public TrendController(ITrendService trendService)
        {
            _trendService = trendService ?? throw new ArgumentNullException(nameof(trendService));
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTrends()
        {
            var result = await _trendService.GetAllTrendsAsync();
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTrendById(int id)
        {
            var result = await _trendService.GetTrendByIdAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetTrendsByCategory(int categoryId)
        {
            var result = await _trendService.GetTrendsByCategoryAsync(categoryId);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("category/{categoryId}/latest")]
        public async Task<IActionResult> GetLatestTrendByCategory(int categoryId)
        {
            var result = await _trendService.GetLatestTrendByCategoryAsync(categoryId);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpPost("category/{categoryId}/generate")]
        public async Task<IActionResult> GenerateTrendForCategory(int categoryId)
        {
            var result = await _trendService.GenerateTrendForCategoryAsync(categoryId);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        private int GetCurrentUserId()
        {
            var userId = UserHelper.GetCurrentUserId(this);
            return userId ?? 0;
        }
    }
}
