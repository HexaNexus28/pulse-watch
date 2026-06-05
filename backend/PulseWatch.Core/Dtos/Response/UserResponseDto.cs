using System;

namespace PulseWatch.Core.Dtos.Response
{
    /// <summary>
    /// DTO for user response
    /// </summary>
    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; }
    }

   
}
