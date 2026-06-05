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
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var result = await _userService.GetAllUsersAsync();
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var result = await _userService.GetUserByIdAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            var result = await _userService.UpdateUserAsync(id, updateUserDto);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await _userService.DeleteUserAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpPost("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordDto changePasswordDto)
        {
            var result = await _userService.ChangePasswordAsync(id, changePasswordDto);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id}/categories")]
        public async Task<IActionResult> GetUserCategories(int id)
        {
            var result = await _userService.GetUserCategoriesAsync(id);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("check-email/{email}")]
        public async Task<IActionResult> CheckEmailExists(string email)
        {
            var result = await _userService.CheckEmailExistsAsync(email);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        [HttpGet("check-username/{username}")]
        public async Task<IActionResult> CheckUsernameExists(string username)
        {
            var result = await _userService.CheckUsernameExistsAsync(username);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
        }

        private int GetCurrentUserId()
        {
            var userId = UserHelper.GetCurrentUserId(this);
            return userId ?? 0;
        }
    }
}
