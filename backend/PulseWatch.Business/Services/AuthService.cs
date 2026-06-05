using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Dtos.Response;
using PulseWatch.Core.Entities;
using PulseWatch.Core.Interfaces.Repositories;
using PulseWatch.Core.Interfaces.Services;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BCrypt.Net;

namespace PulseWatch.Business.Services
{
    /// <summary>
    /// Implémentation du service d'authentification
    /// Utilise IUnitOfWork pour accéder aux repositories et gère l'authentification JWT
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public AuthService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto loginRequest)
        {
            try
            {
                if (loginRequest == null || string.IsNullOrWhiteSpace(loginRequest.Email) || 
                    string.IsNullOrWhiteSpace(loginRequest.Password))
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "Invalid login credentials", 400);
                }

                // Find user by email
                var user = await _unitOfWork.Users.FindAsync(u => u.Email.ToLower() == loginRequest.Email.ToLower());
                var existingUser = user.FirstOrDefault();

                if (existingUser == null)
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "User not found", 404);
                }

                if (!existingUser.IsActive)
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "Account is deactivated", 403);
                }

                // Verify password
                if (!VerifyPassword(loginRequest.Password, existingUser.PasswordHash))
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "Invalid email or password", 401);
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

        public async Task<ApiResponse<LoginResponseDto>> RegisterAsync(RegisterRequestDto registerRequest)
        {
            try
            {
                if (registerRequest == null)
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "Invalid registration data", 400);
                }

                // Check if user already exists by email
                var existingUserByEmail = await _unitOfWork.Users.FindAsync(u => u.Email.ToLower() == registerRequest.Email.ToLower());
                if (existingUserByEmail.Any())
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "User with this email already exists", 409);
                }

                // Check if username already exists
                var existingUserByUsername = await _unitOfWork.Users.FindAsync(u => u.Username.ToLower() == registerRequest.Username.ToLower());
                if (existingUserByUsername.Any())
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "Username already exists", 409);
                }

                // Create new user
                var user = new User
                {
                    Username = registerRequest.Username,
                    Email = registerRequest.Email,
                    PasswordHash = HashPassword(registerRequest.Password),
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                var createdUser = await _unitOfWork.Users.AddAsync(user);
                await _unitOfWork.SaveChangesAsync();

                // Generate tokens
                var token = GenerateJwtToken(createdUser);
                var refreshToken = GenerateRefreshToken();

                // Update user with refresh token
                createdUser.RefreshToken = refreshToken;
                createdUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                _unitOfWork.Users.Update(createdUser);
                await _unitOfWork.SaveChangesAsync();

                var userDto = _mapper.Map<UserResponseDto>(createdUser);
                var response = new LoginResponseDto
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    User = userDto,
                    ExpiresAt = DateTime.UtcNow.AddHours(1)
                };

                return ApiResponse<LoginResponseDto>.SuccessResponse(
                    response,
                    "Registration successful");
            }
            catch (System.Data.SqlClient.SqlException ex) when (ex.Number == 2601 || ex.Number == 2627)
            {
                // Handle unique constraint violations
                if (ex.Message.Contains("Username"))
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "Username already exists", 409);
                }
                else if (ex.Message.Contains("Email"))
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "Email already exists", 409);
                }
                else
                {
                    return ApiResponse<LoginResponseDto>.ErrorResponse(
                        "User already exists", 409);
                }
            }
            catch (Exception ex)
            {
                return ApiResponse<LoginResponseDto>.ErrorResponse(
                    $"An error occurred during registration: {ex.Message}", 500);
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

        public async Task<ApiResponse<bool>> LogoutAsync(string refreshToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(refreshToken))
                {
                    return ApiResponse<bool>.ErrorResponse(
                        "Invalid refresh token", 400);
                }

                // Find user by refresh token and clear it
                var user = await _unitOfWork.Users.FindAsync(u => u.RefreshToken == refreshToken);
                var existingUser = user.FirstOrDefault();

                if (existingUser != null)
                {
                    existingUser.RefreshToken = null;
                    existingUser.RefreshTokenExpiryTime = null;
                    _unitOfWork.Users.Update(existingUser);
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

        public async Task<ApiResponse<bool>> ValidateTokenAsync(string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token))
                {
                    return ApiResponse<bool>.ErrorResponse(
                        "Invalid token", 400);
                }

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "DefaultSecretKey123456789");

                try
                {
                    tokenHandler.ValidateToken(token, new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = true,
                        ValidIssuer = _configuration["Jwt:Issuer"] ?? "PulseWatch",
                        ValidateAudience = true,
                        ValidAudience = _configuration["Jwt:Audience"] ?? "PulseWatch",
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    }, out SecurityToken validatedToken);

                    return ApiResponse<bool>.SuccessResponse(
                        true,
                        "Token is valid");
                }
                catch (Exception)
                {
                    return ApiResponse<bool>.ErrorResponse(
                        "Token is invalid or expired", 401);
                }
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResponse(
                    $"An error occurred during token validation: {ex.Message}", 500);
            }
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
            // For existing users with plain text passwords, verify directly
            // For new users with hashed passwords, use BCrypt
            if (!hash.StartsWith("$2"))
            {
                // Plain text password (existing user)
                return password == hash;
            }
            
            // Hashed password (new user)
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }
    }
}
