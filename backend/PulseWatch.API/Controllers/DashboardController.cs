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
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService ?? throw new ArgumentNullException(nameof(dashboardService));
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var userId = UserHelper.GetCurrentUserId(this);
            if (!userId.HasValue)
            {
                return Unauthorized("User not authenticated");
            }
            
            var result = await _dashboardService.GetStatsAsync(userId.Value);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("activity")]
        public async Task<IActionResult> GetRecentActivity()
        {
            var userId = UserHelper.GetCurrentUserId(this);
            if (!userId.HasValue)
            {
                return Unauthorized("User not authenticated");
            }
            
            var result = await _dashboardService.GetRecentActivityAsync(userId.Value);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetTopCategories()
        {
            var userId = UserHelper.GetCurrentUserId(this);
            if (!userId.HasValue)
            {
                return Unauthorized("User not authenticated");
            }
            
            var result = await _dashboardService.GetTopCategoriesAsync(userId.Value);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }
    }

    public class DashboardStatsDto
    {
        public int TotalCategories { get; set; }
        public int ActiveFeeds { get; set; }
        public int TotalNotes { get; set; }
        public int TrendAnalysis { get; set; }
        public string CategoriesChange { get; set; } = string.Empty;
        public string FeedsChange { get; set; } = string.Empty;
        public string NotesChange { get; set; } = string.Empty;
        public string TrendsChange { get; set; } = string.Empty;
    }

    public class ActivityDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
    }

    public class CategoryStatsDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Trend { get; set; } = string.Empty;
        public string? Color { get; set; }
    }
}
