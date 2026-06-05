using AutoMapper;
using Microsoft.Extensions.Logging;
using PulseWatch.Core.Dtos.Response;
using PulseWatch.Core.Entities;
using PulseWatch.Core.Interfaces.Repositories;
using PulseWatch.Core.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Business.Services
{
    public class TrendService : ITrendService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFeedService _feedService;
        private readonly ILogger<TrendService> _logger;

        public TrendService(IUnitOfWork unitOfWork, IMapper mapper, IFeedService feedService, ILogger<TrendService> logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _feedService = feedService;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // Stop words en anglais ET français
        private readonly HashSet<string> _stopWords = new HashSet<string>
    {
        // Anglais
        "the", "and", "a", "an", "in", "on", "at", "to", "of", "for", "with", "this", "that", "is", "are",
        // Français
        "le", "la", "les", "de", "des", "du", "un", "une", "et", "ou", "à", "au", "aux", "pour", "par",
        "dans", "sur", "avec", "sans", "plus", "mais", "ou", "donc", "ni", "car", "que", "qui", "ce", "se"
    };
        public async  Task<ApiResponse<TrendResponseDto>> GetTrendByIdAsync(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return ApiResponse<TrendResponseDto>.ErrorResponse(
                        "Invalid Trend ID", 400);
                }

                var Trend = await _unitOfWork.Trends.GetByIdAsync(id);

                if (Trend == null)
                {
                    return ApiResponse<TrendResponseDto>.NotFoundResponse(
                        $"Trend with ID {id} not found");
                }

                var TrendDto = _mapper.Map<TrendResponseDto>(Trend);
                return ApiResponse<TrendResponseDto>.SuccessResponse(
                    TrendDto,
                    "Trend retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<TrendResponseDto>.ErrorResponse(
                   $"An error occurred while retrieving Trends{ex.Message}", 500);
            }

        }

        /// <Trend>
        /// Récupère tous les trends
        /// </Trend>
        public async Task<ApiResponse<IEnumerable<TrendResponseDto>>> GetAllTrendsAsync()
        {
            try
            {
                var Trends = await _unitOfWork.Trends.GetAllAsync();
                var TrendDtos = _mapper.Map<IEnumerable<TrendResponseDto>>(Trends);

                return ApiResponse<IEnumerable<TrendResponseDto>>.SuccessResponse(
                    TrendDtos,
                    $"Retrieved {TrendDtos.Count()} active Trends");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<TrendResponseDto>>.ErrorResponse(
                    $"An error occurred while retrieving Trends{ex.Message}", 500);
            }
        }

      
        /// <Trend>
        /// Récupère les trends récents filtrés par catégorie
        /// </Trend>
        public async Task<ApiResponse<IReadOnlyList<TrendResponseDto>>> GetTrendsByCategoryAsync(int categoryId) 
        {
            try
            {
                var Trends = await _unitOfWork.Trends.GetByCategoryAsync(categoryId);
                var TrendDtos = _mapper.Map<IReadOnlyList<TrendResponseDto>>(Trends);

                return ApiResponse<IReadOnlyList<TrendResponseDto>>.SuccessResponse(
                    TrendDtos,
                    $"Retrieved {TrendDtos.Count()} active Trends");
            }
            catch (Exception ex)
            {
                return ApiResponse<IReadOnlyList<TrendResponseDto>>.ErrorResponse(
                    $"An error occurred while retrieving Trends{ex.Message}", 500);
            }
            
        }
        public async Task<ApiResponse<IEnumerable<TrendResponseDto>>> DetectTrendsAsync(int categoryId)
        {
            // 1. Vérification de la catégorie
            var categories = await _unitOfWork.Categories.FindAsync(c => c.Id == categoryId);
            var category = categories.FirstOrDefault();
            if (category == null)
                return ApiResponse<IEnumerable<TrendResponseDto>>.NotFoundResponse("Catégorie introuvable");

            // 2. Récupération des flux de la catégorie
            var feeds = await _unitOfWork.Feeds.GetFeedsByCategoryAsync(categoryId);
            if (!feeds.Any())
                return ApiResponse<IEnumerable<TrendResponseDto>>.NotFoundResponse("Aucun flux trouvé pour cette catégorie");

            // 3. Récupération des titres des articles via FetchFeedContentAsync
            var articleTitles = new List<string>();
            foreach (var feed in feeds)
            {
                var feedContentResult = await _feedService.FetchFeedContentAsync(feed.Id);
                if (feedContentResult.Success && feedContentResult.Data != null)
                {
                    var titles = feedContentResult.Data.Select(item => item.Title).ToList();
                    articleTitles.AddRange(titles);
                }
            }

            if (!articleTitles.Any())
                return ApiResponse<IEnumerable<TrendResponseDto>>.NotFoundResponse("Aucun contenu trouvé pour les flux sélectionnés");

            // 4. Nettoyage et analyse des mots-clés (bilingue)
            var wordCounts = articleTitles
                .SelectMany(title =>
                    title.ToLower()
                        .Split(new[] { ' ', ',', '.', ';', '!', '?', '-', '_', '(', ')' },
                               StringSplitOptions.RemoveEmptyEntries)
                )
                .Where(word => !_stopWords.Contains(word) && word.Length > 3)
                .GroupBy(word => word)
                .ToDictionary(g => g.Key, g => g.Count());

            if (!wordCounts.Any())
                return ApiResponse<IEnumerable<TrendResponseDto>>.NotFoundResponse("Aucun mot-clé pertinent détecté");

            // 5. Normalisation des scores (0 à 1)
            var maxCount = wordCounts.Values.Max();
            var trendsData = wordCounts.ToDictionary(
                kv => kv.Key,
                kv => Math.Round((double)kv.Value / maxCount, 2)
            );

            // 6. Création du Trend
            var trend = new Trend
            {
                CategoryId = categoryId,
                Data = trendsData,
                GeneratedAt = DateTime.UtcNow
            };

            await _unitOfWork.Trends.AddAsync(trend);
            await _unitOfWork.SaveChangesAsync();

            // 7. Préparation de la réponse
            var responseDto = new TrendResponseDto
            {
                Id = trend.Id,
                CategoryId = trend.CategoryId,
                CategoryName = category.Name,
                GeneratedAt = trend.GeneratedAt,
                Data = trend.Data
            };

            return ApiResponse<IEnumerable<TrendResponseDto>>.SuccessResponse(new List<TrendResponseDto> { responseDto }, "");
        }

        public async Task<ApiResponse<TrendResponseDto>> GetLatestAnalysisScoreAsync(int categoryId)
        {
            try
            {
                var trends = await _unitOfWork.Trends.FindAsync(t => t.CategoryId == categoryId);
                var latestTrend = trends.OrderByDescending(t => t.GeneratedAt).FirstOrDefault();
                
                if (latestTrend == null)
                {
                    return ApiResponse<TrendResponseDto>.NotFoundResponse($"No trend found for category {categoryId}");
                }

                var trendDto = _mapper.Map<TrendResponseDto>(latestTrend);
                return ApiResponse<TrendResponseDto>.SuccessResponse(trendDto, "Latest trend retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<TrendResponseDto>.ErrorResponse($"Error retrieving latest trend: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<IEnumerable<TrendResponseDto>>> GetRecentByUserAsync(int userId, int limit = 10)
        {
            try
            {
                var trends = await _unitOfWork.Trends.GetAllAsync();
                var userTrends = trends.Where(t => t.Category?.UserId == userId).OrderByDescending(t => t.GeneratedAt).Take(limit);
                var trendDtos = _mapper.Map<IEnumerable<TrendResponseDto>>(userTrends);
                return ApiResponse<IEnumerable<TrendResponseDto>>.SuccessResponse(trendDtos, "Recent trends retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<TrendResponseDto>>.ErrorResponse($"Error retrieving recent trends: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<TrendResponseDto>> GetLatestTrendByCategoryAsync(int categoryId)
        {
            _logger.LogInformation("Début de GetLatestTrendByCategoryAsync pour categoryId: {CategoryId}", categoryId);
            
            try
            {
                var trends = await _unitOfWork.Trends.FindAsync(t => t.CategoryId == categoryId);
                var latestTrend = trends.OrderByDescending(t => t.GeneratedAt).FirstOrDefault();
                
                if (latestTrend == null)
                {
                    return ApiResponse<TrendResponseDto>.NotFoundResponse($"No trends found for category {categoryId}");
                }

                var trendDto = _mapper.Map<TrendResponseDto>(latestTrend);
                return ApiResponse<TrendResponseDto>.SuccessResponse(trendDto, "Latest trend retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du latest trend pour categoryId: {CategoryId}", categoryId);
                return ApiResponse<TrendResponseDto>.ErrorResponse($"Error retrieving latest trend: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<TrendResponseDto>> GenerateTrendForCategoryAsync(int categoryId)
        {
            _logger.LogInformation("Début de GenerateTrendForCategoryAsync pour categoryId: {CategoryId}", categoryId);
            
            try
            {
                // 1. Récupérer la catégorie
                var category = await _unitOfWork.Categories.GetByIdAsync(categoryId);
                if (category == null)
                {
                    return ApiResponse<TrendResponseDto>.NotFoundResponse($"Category {categoryId} not found");
                }

                // 2. Récupérer les feeds de cette catégorie
                var feeds = await _unitOfWork.Feeds.GetFeedsByCategoryAsync(categoryId);
                if (!feeds.Any())
                {
                    return ApiResponse<TrendResponseDto>.ErrorResponse($"No feeds found for category {categoryId}");
                }

                // 3. Récupération des titres des articles via FetchFeedContentAsync
                var articleTitles = new List<string>();
                foreach (var feed in feeds)
                {
                    var feedContentResult = await _feedService.FetchFeedContentAsync(feed.Id);
                    if (feedContentResult.Success && feedContentResult.Data != null)
                    {
                        var titles = feedContentResult.Data.Select(item => item.Title).ToList();
                        articleTitles.AddRange(titles);
                    }
                }

                if (!articleTitles.Any())
                {
                    return ApiResponse<TrendResponseDto>.ErrorResponse($"No content found for feeds in category {categoryId}");
                }

                // 4. Nettoyage et analyse des mots-clés (bilingue)
                var wordCounts = articleTitles
                    .SelectMany(title =>
                        title.ToLower()
                            .Split(new[] { ' ', ',', '.', ';', '!', '?', '-', '_', '(', ')' },
                                   StringSplitOptions.RemoveEmptyEntries)
                    )
                    .Where(word => !_stopWords.Contains(word) && word.Length > 3)
                    .GroupBy(word => word)
                    .ToDictionary(g => g.Key, g => g.Count());

                if (!wordCounts.Any())
                {
                    return ApiResponse<TrendResponseDto>.ErrorResponse("No relevant keywords detected");
                }

                // 5. Normalisation des scores (0 à 1)
                var maxCount = wordCounts.Values.Max();
                var trendsData = wordCounts.ToDictionary(
                    kv => kv.Key,
                    kv => Math.Round((double)kv.Value / maxCount, 2)
                );

                // 6. Calculer le score global (moyenne des scores normalisés)
                var score = Math.Round(trendsData.Values.Average() * 100);

                // 7. Ajouter des métadonnées enrichies
                var enrichedData = new Dictionary<string, object>
                {
                    ["keywords"] = trendsData.Keys.ToList(),
                    ["keywordScores"] = trendsData,
                    ["totalArticles"] = articleTitles.Count,
                    ["totalFeeds"] = feeds.Count,
                    ["analysisDate"] = DateTime.UtcNow,
                    ["category"] = category.Name
                };

                // 8. Créer le trend avec les vraies données
                var trend = new Trend
                {
                    CategoryId = categoryId,
                    Score = (int)score,
                    Data = enrichedData,
                    GeneratedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddDays(7) // Expire après 7 jours
                };

                await _unitOfWork.Trends.AddAsync(trend);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Trend généré avec succès pour categoryId: {CategoryId}, TrendId: {TrendId}, Score: {Score}", 
                    categoryId, trend.Id, trend.Score);

                var trendDto = _mapper.Map<TrendResponseDto>(trend);
                return ApiResponse<TrendResponseDto>.SuccessResponse(trendDto, $"Trend generated successfully with {trendsData.Count} keywords");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la génération du trend pour categoryId: {CategoryId}", categoryId);
                return ApiResponse<TrendResponseDto>.ErrorResponse($"Error generating trend: {ex.Message}");
            }
        }
    }
}
