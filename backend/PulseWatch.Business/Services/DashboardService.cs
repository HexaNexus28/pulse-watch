using AutoMapper;
using Microsoft.Extensions.Logging;
using PulseWatch.Core.Dtos.Response;
using PulseWatch.Core.Entities;
using PulseWatch.Core.Interfaces.Repositories;
using PulseWatch.Core.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PulseWatch.Business.Services
{
    /// <summary>
    /// Implémentation du service de dashboard
    /// Utilise IUnitOfWork pour accéder aux repositories et centraliser la logique métier
    /// </summary>
    public class DashboardService : IDashboardService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<DashboardService> _logger;

        public DashboardService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<DashboardService> logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ApiResponse<DashboardStatsDto>> GetStatsAsync(int userId)
        {
            _logger.LogInformation("Début de GetStatsAsync pour userId: {UserId}", userId);
            
            try
            {
                _logger.LogDebug("Récupération des statistiques depuis les repositories");
                
                // Get current stats using repositories through UnitOfWork
                var totalCategories = await _unitOfWork.Categories.CountAsync();
                _logger.LogDebug("Total catégories récupéré: {Count}", totalCategories);
                
                var activeFeeds = await _unitOfWork.Feeds.CountAsync();
                _logger.LogDebug("Total feeds récupéré: {Count}", activeFeeds);
                
                var totalNotes = await _unitOfWork.Notes.CountAsync();
                _logger.LogDebug("Total notes récupéré: {Count}", totalNotes);
                
                // Get latest trend analysis score
                var latestTrend = await _unitOfWork.Trends.FindAsync(t => t.GeneratedAt >= DateTime.UtcNow.AddDays(-7));
                var trendAnalysis = latestTrend.Any() ? latestTrend.Average(t => t.Score ?? 0) : 0;
                _logger.LogDebug("Trend analysis score récupéré: {Score}", trendAnalysis);

                // Get previous week stats for comparison
                var lastWeekStats = await GetLastWeekStatsAsync(userId);

                var stats = new DashboardStatsDto
                {
                    TotalCategories = totalCategories,
                    ActiveFeeds = activeFeeds,
                    TotalNotes = totalNotes,
                    TrendAnalysis = (int)trendAnalysis,
                    CategoriesChange = CalculateChange(lastWeekStats.TotalCategories, totalCategories),
                    FeedsChange = CalculateChange(lastWeekStats.ActiveFeeds, activeFeeds),
                    NotesChange = CalculateChange(lastWeekStats.TotalNotes, totalNotes),
                    TrendsChange = CalculateChange(lastWeekStats.TrendAnalysis, (int)trendAnalysis)
                };

                return ApiResponse<DashboardStatsDto>.SuccessResponse(
                    stats,
                    "Dashboard stats retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<DashboardStatsDto>.ErrorResponse(
                    $"An error occurred while retrieving dashboard stats: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<IEnumerable<ActivityDto>>> GetRecentActivityAsync(int userId, int limit = 10)
        {
            _logger.LogInformation("Début de GetRecentActivityAsync pour userId: {UserId}, limit: {Limit}", userId, limit);
            
            try
            {
                _logger.LogDebug("Récupération des activités récentes");
                var activities = new List<ActivityDto>();

                // Get recent notes
                _logger.LogDebug("Récupération des notes récentes");
                var recentNotes = await _unitOfWork.Notes.FindAsync(n => n.CreatedAt >= DateTime.UtcNow.AddDays(-7));
                _logger.LogDebug("Notes récentes trouvées: {Count}", recentNotes.Count());
                
                activities.AddRange(recentNotes.Take(limit).Select(note => new ActivityDto
                {
                    Id = note.Id,
                    Type = "note",
                    Title = note.Title,
                    Timestamp = FormatTimestamp(note.CreatedAt),
                    Category = note.Category?.Name ?? "Uncategorized",
                    CategoryId = note.CategoryId
                }));

                // Get recent feeds
                _logger.LogDebug("Récupération des feeds récents");
                var recentFeeds = await _unitOfWork.Feeds.FindAsync(f => f.CreatedAt >= DateTime.UtcNow.AddDays(-7));
                _logger.LogDebug("Feeds récents trouvés: {Count}", recentFeeds.Count());
                
                activities.AddRange(recentFeeds.Take(limit).Select(feed => new ActivityDto
                {
                    Id = feed.Id,
                    Type = "feed",
                    Title = $"Added new RSS feed: {feed.Name}",
                    Timestamp = FormatTimestamp(feed.CreatedAt),
                    Category = feed.Category?.Name ?? "Uncategorized",
                    CategoryId = feed.CategoryId
                }));

                // Get recent trends
                var recentTrends = await _unitOfWork.Trends.FindAsync(t => t.GeneratedAt >= DateTime.UtcNow.AddDays(-7));
                
                activities.AddRange(recentTrends.Take(limit).Select(trend => new ActivityDto
                {
                    Id = trend.Id,
                    Type = "trend",
                    Title = $"Trend analysis completed for {trend.Category?.Name ?? "Unknown"}",
                    Timestamp = FormatTimestamp(trend.GeneratedAt),
                    Category = trend.Category?.Name ?? "Uncategorized",
                    CategoryId = trend.CategoryId
                }));

                // Get recent summaries
                var recentSummaries = await _unitOfWork.Summaries.FindAsync(s => s.GeneratedAt >= DateTime.UtcNow.AddDays(-7));
                
                activities.AddRange(recentSummaries.Take(limit).Select(summary => new ActivityDto
                {
                    Id = summary.Id,
                    Type = "summary",
                    Title = "Daily summary generated",
                    Timestamp = FormatTimestamp(summary.GeneratedAt),
                    Category = "All Categories"
                }));

                // Sort by timestamp and take latest
                var sortedActivities = activities
                    .OrderByDescending(a => a.Timestamp)
                    .Take(limit)
                    .ToList();

                return ApiResponse<IEnumerable<ActivityDto>>.SuccessResponse(
                    sortedActivities,
                    "Recent activity retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<ActivityDto>>.ErrorResponse(
                    $"An error occurred while retrieving recent activity: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<IEnumerable<CategoryStatsDto>>> GetTopCategoriesAsync(int userId, int limit = 10)
        {
            try
            {
                var categories = await _unitOfWork.Categories.GetAllAsync();

                var categoryStats = categories.Select(category => new CategoryStatsDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    Count = (category.Feeds?.Count() ?? 0) + (category.Notes?.Count() ?? 0),
                    Trend = CalculateTrend(category),
                    Color = category.Color
                })
                .OrderByDescending(c => c.Count)
                .Take(limit)
                .ToList();

                return ApiResponse<IEnumerable<CategoryStatsDto>>.SuccessResponse(
                    categoryStats,
                    "Top categories retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<CategoryStatsDto>>.ErrorResponse(
                    $"An error occurred while retrieving top categories: {ex.Message}", 500);
            }
        }

        public async Task<DashboardStatsDto> GetLastWeekStatsAsync(int userId)
        {
            // TODO: Implement proper historical data retrieval
            // For now, return mock data based on current data
            var totalCategories = await _unitOfWork.Categories.CountAsync();
            var activeFeeds = await _unitOfWork.Feeds.CountAsync();
            var totalNotes = await _unitOfWork.Notes.CountAsync();

            return new DashboardStatsDto
            {
                TotalCategories = Math.Max(0, totalCategories - 2),
                ActiveFeeds = Math.Max(0, activeFeeds - 5),
                TotalNotes = Math.Max(0, totalNotes - 10),
                TrendAnalysis = Math.Max(0, 75)
            };
        }

        private string CalculateChange(int oldValue, int newValue)
        {
            if (oldValue == 0) return $"+{newValue}";
            
            var change = newValue - oldValue;
            var percentage = (double)change / oldValue * 100;
            
            return percentage >= 0 ? $"+{percentage:F0}%" : $"{percentage:F0}%";
        }

        private string CalculateTrend(Category category)
        {
            // TODO: Implement proper trend calculation based on historical data
            // For now, return mock trend based on activity
            var random = new Random();
            var trend = random.Next(-5, 20);
            return trend >= 0 ? $"+{trend}%" : $"{trend}%";
        }

        private string FormatTimestamp(DateTime dateTime)
        {
            var now = DateTime.UtcNow;
            var timeSpan = now - dateTime;

            if (timeSpan.TotalHours < 1)
            {
                var minutes = (int)timeSpan.TotalMinutes;
                return minutes <= 1 ? "Just now" : $"{minutes} minutes ago";
            }
            else if (timeSpan.TotalDays < 1)
            {
                var hours = (int)timeSpan.TotalHours;
                return hours == 1 ? "1 hour ago" : $"{hours} hours ago";
            }
            else if (timeSpan.TotalDays < 7)
            {
                var days = (int)timeSpan.TotalDays;
                return days == 1 ? "1 day ago" : $"{days} days ago";
            }
            else
            {
                return dateTime.ToString("MMM dd, yyyy");
            }
        }
    }
}
