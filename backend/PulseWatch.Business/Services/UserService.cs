using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Dtos.Response;
using PulseWatch.Core.Entities;
using PulseWatch.Core.Interfaces.Repositories;
using PulseWatch.Core.Interfaces.Services;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Business.Services
{
    /// <summary>
    /// Implémentation du service utilisateur
    /// Utilise IUnitOfWork pour accéder aux repositories et gère l'authentification JWT
    /// </summary>
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly ILogger<UserService> _logger;

        public UserService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration, ILogger<UserService> logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ApiResponse<UserResponseDto>> RegisterAsync(RegisterRequestDto registerDto)
        {
            try
            {
                if (registerDto == null)
                {
                    return ApiResponse<UserResponseDto>.ErrorResponse(
                        "Invalid registration data", 400);
                }

                // Check if user already exists
                if (await EmailExistsAsync(registerDto.Email))
                {
                    return ApiResponse<UserResponseDto>.ErrorResponse(
                        "User with this email already exists", 409);
                }

                if (await UsernameExistsAsync(registerDto.Username))
                {
                    return ApiResponse<UserResponseDto>.ErrorResponse(
                        "Username already taken", 409);
                }

                // Create new user
                var user = new User
                {
                    Username = registerDto.Username,
                    Email = registerDto.Email,
                    PasswordHash = HashPassword(registerDto.Password), // TODO: Implement proper password hashing
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                var createdUser = await _unitOfWork.Users.AddAsync(user);
                await _unitOfWork.SaveChangesAsync();

                var userDto = _mapper.Map<UserResponseDto>(createdUser);
                return ApiResponse<UserResponseDto>.SuccessResponse(
                    userDto,
                    "Registration successful");
            }
            catch (Exception ex)
            {
                return ApiResponse<UserResponseDto>.ErrorResponse(
                    $"An error occurred during registration: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto loginDto)
        {
            try
            {
                if (loginDto == null || string.IsNullOrWhiteSpace(loginDto.Email) || 
                    string.IsNullOrWhiteSpace(loginDto.Password))
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "Invalid login credentials", 400);
                }

                // Find user by email
                var user = await _unitOfWork.Users.FindAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());
                var existingUser = user.FirstOrDefault();

                if (existingUser == null)
                {
                    return ApiResponse<LoginResponseDto>.NotFoundResponse(
                        "User not found");
                }

                if (!existingUser.IsActive)
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "Account is deactivated", 401);
                }

                // Verify password
                if (!VerifyPassword(loginDto.Password, existingUser.PasswordHash))
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "Invalid password", 401);
                }

                // Generate JWT token
                var token = GenerateJwtToken(existingUser);
                var refreshToken = GenerateRefreshToken();

                // Update user with refresh token
                existingUser.RefreshToken = refreshToken;
                existingUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                _unitOfWork.Users.Update(existingUser);
                await _unitOfWork.SaveChangesAsync();

                var userDto = _mapper.Map<UserResponseDto>(existingUser);
                var response = new LoginResponseDto
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    User = userDto,
                    ExpiresAt = DateTime.UtcNow.AddHours(1)
                };

                return ApiResponse<LoginResponseDto>.SuccessResponse(
                    response,
                    "Login successful");
            }
            catch (Exception ex)
            {
                return ApiResponse<LoginResponseDto>.ErrorResponse(
                    $"An error occurred during login: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<LoginResponseDto>> RefreshTokenAsync(string refreshToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(refreshToken))
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "Invalid refresh token", 400);
                }

                // Find user by refresh token
                var user = await _unitOfWork.Users.FindAsync(u => u.RefreshToken == refreshToken && 
                    u.RefreshTokenExpiryTime > DateTime.UtcNow);
                var existingUser = user.FirstOrDefault();

                if (existingUser == null)
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "Invalid or expired refresh token", 401);
                }

                // Generate new tokens
                var newToken = GenerateJwtToken(existingUser);
                var newRefreshToken = GenerateRefreshToken();

                // Update user with new refresh token
                existingUser.RefreshToken = newRefreshToken;
                existingUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                _unitOfWork.Users.Update(existingUser);
                await _unitOfWork.SaveChangesAsync();

                var userDto = _mapper.Map<UserResponseDto>(existingUser);
                var response = new LoginResponseDto
                {
                    Token = newToken,
                    RefreshToken = newRefreshToken,
                    User = userDto,
                    ExpiresAt = DateTime.UtcNow.AddHours(1)
                };

                return ApiResponse<LoginResponseDto>.SuccessResponse(
                    response,
                    "Token refreshed successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<LoginResponseDto>.ErrorResponse(
                    $"An error occurred during token refresh: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<bool>> LogoutAsync(int userId)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user != null)
                {
                    user.RefreshToken = null;
                    user.RefreshTokenExpiryTime = null;
                    _unitOfWork.Users.Update(user);
                    await _unitOfWork.SaveChangesAsync();
                }

                return ApiResponse<bool>.SuccessResponse(
                    true,
                    "Logout successful");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResponse(
                    $"An error occurred during logout: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<UserResponseDto>> GetUserByIdAsync(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return  ApiResponse<UserResponseDto>.ErrorResponse(
                        "Invalid User ID", 400);
                }

                var user = await _unitOfWork.Users.GetByIdAsync(id);

                if (user == null)
                {
                    return  ApiResponse<UserResponseDto>.NotFoundResponse(
                        $"User with ID {id} not found");
                }

                var userDto = _mapper.Map<UserResponseDto>(user);
                return  ApiResponse<UserResponseDto>.SuccessResponse(
                    userDto,
                    "User retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<UserResponseDto>.ErrorResponse(
                    $"An error occurred while retrieving user: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<IEnumerable<UserResponseDto>>> GetAllUsersAsync()
        {
            try
            {
                var users = await _unitOfWork.Users.GetAllAsync();
                var userDtos = _mapper.Map<IEnumerable<UserResponseDto>>(users);
                
                return ApiResponse<IEnumerable<UserResponseDto>>.SuccessResponse(
                    userDtos,
                    "Users retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<UserResponseDto>>.ErrorResponse(
                    $"An error occurred while retrieving users: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<UserResponseDto>> CreateUserAsync(CreateUserDto dto)
        {
            // TODO: Implement CreateUserDto and this method
            return ApiResponse<UserResponseDto>.ErrorResponse(
                "Method not implemented yet", 501);
        }

        public async Task<ApiResponse<UserResponseDto>> UpdateUserAsync(int id, UpdateUserDto updateUserDto)
        {
            try
            {
                if (id <= 0)
                {
                    return ApiResponse<UserResponseDto>.ErrorResponse(
                        "Invalid User ID", 400);
                }

                var existingUser = await _unitOfWork.Users.GetByIdAsync(id);
                if (existingUser == null)
                {
                    return ApiResponse<UserResponseDto>.NotFoundResponse(
                        $"User with ID {id} not found");
                }

                // Check if email is being changed and if it already exists
                if (!string.IsNullOrWhiteSpace(updateUserDto.Email) && 
                    updateUserDto.Email.ToLower() != existingUser.Email.ToLower() &&
                    await EmailExistsAsync(updateUserDto.Email))
                {
                    return ApiResponse<UserResponseDto>.ErrorResponse(
                        "Email already exists", 409);
                }

                _mapper.Map(updateUserDto, existingUser);
                _unitOfWork.Users.Update(existingUser);
                await _unitOfWork.SaveChangesAsync();

                var userDto = _mapper.Map<UserResponseDto>(existingUser);
                return ApiResponse<UserResponseDto>.SuccessResponse(
                    userDto,
                    "User updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<UserResponseDto>.ErrorResponse(
                    $"An error occurred while updating user: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<bool>> DeleteUserAsync(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return ApiResponse<bool>.ErrorResponse(
                        "Invalid User ID", 400);
                }

                var existingUser = await _unitOfWork.Users.GetByIdAsync(id);
                if (existingUser == null)
                {
                    return ApiResponse<bool>.NotFoundResponse(
                        $"User with ID {id} not found");
                }

                _unitOfWork.Users.Remove(existingUser);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse<bool>.SuccessResponse(
                    true,
                    "User deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResponse(
                    $"An error occurred while deleting user: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<bool>> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            try
            {
                if (userId <= 0 || changePasswordDto == null)
                {
                    return ApiResponse<bool>.ErrorResponse(
                        "Invalid request data", 400);
                }

                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<bool>.NotFoundResponse(
                        "User not found");
                }

                // Verify current password
                if (!VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
                {
                    return ApiResponse<bool>.ErrorResponse(
                        "Current password is incorrect", 401);
                }

                // Update password
                user.PasswordHash = HashPassword(changePasswordDto.NewPassword);
                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse<bool>.SuccessResponse(
                    true,
                    "Password changed successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResponse(
                    $"An error occurred while changing password: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<IEnumerable<CategoryResponseDto>>> GetUserCategoriesAsync(int userId)
        {
            try
            {
                // TODO: Implement user filtering when UserId is properly handled in Category entity
                var categories = await _unitOfWork.Categories.GetAllAsync();
                var categoryDtos = _mapper.Map<IEnumerable<CategoryResponseDto>>(categories);
                
                return ApiResponse<IEnumerable<CategoryResponseDto>>.SuccessResponse(
                    categoryDtos,
                    "User categories retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<CategoryResponseDto>>.ErrorResponse(
                    $"An error occurred while retrieving user categories: {ex.Message}", 500);
            }
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            var user = await _unitOfWork.Users.FindAsync(u => u.Email.ToLower() == email.ToLower());
            return user.Any();
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return false;

            var user = await _unitOfWork.Users.FindAsync(u => u.Username.ToLower() == username.ToLower());
            return user.Any();
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "DefaultSecretKey123456789");
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.Username)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = _configuration["Jwt:Issuer"] ?? "PulseWatch",
                Audience = _configuration["Jwt:Audience"] ?? "PulseWatch",
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            return Guid.NewGuid().ToString();
        }

        private bool VerifyPassword(string password, string hash)
        {
            // TODO: Implement proper password verification (e.g., using BCrypt)
            return password == hash; // Temporary implementation
        }

        private string HashPassword(string password)
        {
            // TODO: Implement proper password hashing (e.g., using BCrypt)
            return password; // Temporary implementation
        }

        // Méthodes supplémentaires pour le controller
        public async Task<ApiResponse<bool>> CheckEmailExistsAsync(string email)
        {
            _logger.LogInformation("Début de CheckEmailExistsAsync pour email: {Email}", email);
            
            try
            {
                var exists = await EmailExistsAsync(email);
                return ApiResponse<bool>.SuccessResponse(exists, exists ? "Email exists" : "Email does not exist");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification de l'email: {Email}", email);
                return ApiResponse<bool>.ErrorResponse($"Error checking email existence: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<bool>> CheckUsernameExistsAsync(string username)
        {
            _logger.LogInformation("Début de CheckUsernameExistsAsync pour username: {Username}", username);
            
            try
            {
                var exists = await UsernameExistsAsync(username);
                return ApiResponse<bool>.SuccessResponse(exists, exists ? "Username exists" : "Username does not exist");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification du username: {Username}", username);
                return ApiResponse<bool>.ErrorResponse($"Error checking username existence: {ex.Message}", 500);
            }
        }
    }
}
