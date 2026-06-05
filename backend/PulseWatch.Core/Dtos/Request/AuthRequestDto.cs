using System.ComponentModel.DataAnnotations;
using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Dtos.Response;

namespace PulseWatch.Core.Dtos.Request
{
    /// <summary>
    /// DTO for user registration request
    /// </summary>
    public class RegisterRequestDto
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for user login request
    /// </summary>
    public class LoginRequestDto
    {
        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for user update request
    /// </summary>
    public class UpdateUserDto
    {
        [StringLength(50, MinimumLength = 3)]
        public string? Username { get; set; }

        [EmailAddress]
        [StringLength(100)]
        public string? Email { get; set; }
    }

    /// <summary>
    /// DTO for login response
    /// </summary>
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UserResponseDto User { get; set; } = new();
        public DateTime ExpiresAt { get; set; }
    }

    /// <summary>
    /// DTO for change password request
    /// </summary>
    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
