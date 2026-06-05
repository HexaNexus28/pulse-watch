using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Interfaces.Services;

namespace PulseWatch.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequestDto loginRequest)
        {
            try
            {
                var result = await _authService.LoginAsync(loginRequest);

                if (!result.Success)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error during login", error = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] RegisterRequestDto registerRequest)
        {
            try
            {
                var result = await _authService.RegisterAsync(registerRequest);

                if (!result.Success)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error during registration", error = ex.Message });
            }
        }

        [HttpPost("refresh")]
        public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                var result = await _authService.RefreshTokenAsync(request.RefreshToken);

                if (!result.Success)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error during token refresh", error = ex.Message });
            }
        }

        [HttpPost("logout")]
        public async Task<ActionResult> Logout([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                var result = await _authService.LogoutAsync(request.RefreshToken);

                if (!result.Success)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error during logout", error = ex.Message });
            }
        }

        [HttpPost("validate")]
        public async Task<ActionResult> ValidateToken([FromBody] ValidateTokenRequestDto request)
        {
            try
            {
                var result = await _authService.ValidateTokenAsync(request.Token);

                if (!result.Success)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error during token validation", error = ex.Message });
            }
        }
    }

    /// <summary>
    /// DTO pour rafraîchir un token
    /// </summary>
    public class RefreshTokenRequestDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO pour valider un token
    /// </summary>
    public class ValidateTokenRequestDto
    {
        public string Token { get; set; } = string.Empty;
    }
}
