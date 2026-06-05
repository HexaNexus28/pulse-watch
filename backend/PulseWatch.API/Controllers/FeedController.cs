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
    public class FeedController : ControllerBase
    {
        private readonly IFeedService _feedService;

        public FeedController(IFeedService feedService)
        {
            _feedService = feedService ?? throw new ArgumentNullException(nameof(feedService));
        }

        [HttpGet]
        public async Task<IActionResult> GetAllFeeds()
        {
            var result = await _feedService.GetAllFeedsAsync();
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFeedById(int id)
        {
            var result = await _feedService.GetFeedByIdAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateFeed([FromBody] CreateFeedDto createFeedDto)
        {
            var result = await _feedService.AddFeedAsync(createFeedDto);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeed(int id)
        {
            var result = await _feedService.DeleteFeedAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id}/fetch")]
        public async Task<IActionResult> FetchFeedContent(int id)
        {
            var result = await _feedService.FetchFeedContentAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetFeedsByCategory(int categoryId)
        {
            var result = await _feedService.GetFeedsByCategoryAsync(categoryId);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("user/{userId}/active/count")]
        public async Task<IActionResult> GetActiveFeedsCountByUser(int userId)
        {
            var result = await _feedService.GetActiveCountByUserAsync(userId);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("user/{userId}/recent")]
        public async Task<IActionResult> GetRecentFeedsByUser(int userId, [FromQuery] int limit = 10)
        {
            var result = await _feedService.GetRecentByUserAsync(userId, limit);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        private int GetCurrentUserId()
        {
            var userId = UserHelper.GetCurrentUserId(this);
            return userId ?? 0;
        }
    }
}
