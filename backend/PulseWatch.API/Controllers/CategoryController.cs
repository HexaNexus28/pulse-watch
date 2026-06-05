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
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService ?? throw new ArgumentNullException(nameof(categoryService));
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            var result = await _categoryService.GetAllCategoriesAsync();
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var result = await _categoryService.GetCategoryByIdAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto createCategoryDto)
        {
            var result = await _categoryService.CreateCategoryAsync(createCategoryDto);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto updateCategoryDto)
        {
            var result = await _categoryService.UpdateCategoryAsync(id, updateCategoryDto);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var result = await _categoryService.DeleteCategoryAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id}/notes")]
        public async Task<IActionResult> GetCategoryNotes(int id)
        {
            var result = await _categoryService.GetCategoryNotesAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id}/feeds")]
        public async Task<IActionResult> GetCategoryFeeds(int id)
        {
            var result = await _categoryService.GetCategoryFeedsAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id}/trends")]
        public async Task<IActionResult> GetCategoryTrends(int id)
        {
            var result = await _categoryService.GetCategoryTrendsAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        private int GetCurrentUserId()
        {
            var userId = UserHelper.GetCurrentUserId(this);
            return userId ?? 0;
        }
    }
}
