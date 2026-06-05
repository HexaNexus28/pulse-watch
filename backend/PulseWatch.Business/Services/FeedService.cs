using AutoMapper;
using Microsoft.Extensions.Caching.Memory;
using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Dtos.Response;
using PulseWatch.Core.Entities;
using PulseWatch.Core.Interfaces.Repositories;
using PulseWatch.Core.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel.Syndication;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace PulseWatch.Business.Services
{
   public class FeedService :IFeedService
    {
        private readonly IMemoryCache _cache;
        private readonly HttpClient _httpClient;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;


        public FeedService(IUnitOfWork unitOfWork, IMapper mapper, IMemoryCache cache, HttpClient httpClient)
        {

            _cache = cache;
            _httpClient = httpClient;

            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<ApiResponse<FeedResponseDto>> GetFeedByIdAsync(int id) 
        {
            try
            {
                if (id <= 0)
                {
                    return ApiResponse<FeedResponseDto>.ErrorResponse(
                        "Invalid Feed ID", 400);
                }

                var Feed = await _unitOfWork.Feeds.GetByIdAsync(id);

                if (Feed == null)
                {
                    return ApiResponse<FeedResponseDto>.NotFoundResponse(
                        $"Feed with ID {id} not found");
                }

                var FeedDto = _mapper.Map<FeedResponseDto>(Feed);
                return ApiResponse<FeedResponseDto>.SuccessResponse(
                    FeedDto,
                    "Feed retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<FeedResponseDto>.ErrorResponse(
                    $"An error occurred while retrieving the Feed {ex.Message} ", 500);
            }
        }

        /// <Feed>
        /// Récupère tous les flux
        /// </Feed>
        public async Task<ApiResponse<IEnumerable<FeedResponseDto>>> GetAllFeedsAsync() {
            try
            {
                var feeds = await _unitOfWork.Feeds.GetAllAsync();
                var feedDtos = _mapper.Map<IEnumerable<FeedResponseDto>>(feeds);

                return ApiResponse<IEnumerable<FeedResponseDto>>.SuccessResponse(
                    feedDtos,
                    $"Retrieved {feedDtos.Count()} active feeds");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<FeedResponseDto>>.ErrorResponse(
                    $"An error occurred while retrieving feeds{ex.Message}", 500);
            }
        }

        /// <Feed>
        /// Ajoute un flux RSS
        /// </Feed>
        public async Task<ApiResponse<FeedResponseDto>> AddFeedAsync(CreateFeedDto dto)
        {
            try
            {
                // Validation
                if (dto == null)
                {
                    return ApiResponse<FeedResponseDto>.ErrorResponse(
                        "Invalid Feed data", 400);
                }

                // Vérifier l'unicité de url 
                if (!await _unitOfWork.Feeds.IsUrlUniqueAsync(dto.URL))
                {
                    return ApiResponse<FeedResponseDto>.ErrorResponse(
                        "url already exists", 400);
                }

                var Feed = _mapper.Map<Feed>(dto);

                Feed.URL = dto.URL;
                Feed.CategoryId = dto.CategoryId;
                Feed.CreatedAt = DateTime.Now;

                await _unitOfWork.Feeds.AddAsync(Feed);
                await _unitOfWork.SaveChangesAsync();

                // Recharger avec le Category
                var createdFeed = await _unitOfWork.Feeds.GetByIdAsync(Feed.Id);

                
                var FeedDto = _mapper.Map<FeedResponseDto>(createdFeed);
                return ApiResponse<FeedResponseDto>.CreatedResponse(
                    FeedDto,
                    "Feed created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<FeedResponseDto>.ErrorResponse(
                    $"An error occurred while creating the Feed {ex.Message}", 500);
            }
        }

        /// <Feed>
        /// Supprime un flux RSS
        /// </Feed>
        public async Task<ApiResponse<bool>> DeleteFeedAsync(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return ApiResponse<bool>.ErrorResponse(
                        "Invalid Feed ID", 400);
                }

                var Feed = await _unitOfWork.Feeds.GetByIdAsync(id);

                if (Feed == null)
                {
                    return ApiResponse<bool>.NotFoundResponse(
                        $"Feed with ID {id} not found");
                }

                // Soft delete
                Feed = null;
                
                _unitOfWork.Feeds.Update(Feed);
                await _unitOfWork.SaveChangesAsync();

                
                return ApiResponse<bool>.SuccessResponse(
                    true,
                    "Feed deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResponse(
                    $"An error occurred while deleting the Feed {ex.Message}", 500);
            }
        }

        

        /// <Feed>
        /// Récupère tous les feeds d'une catégorie
        /// </Feed>
        public async Task<ApiResponse<IEnumerable<FeedResponseDto>>> GetFeedsByCategoryAsync(int categoryId)
        {
            try
            {
                if (categoryId <= 0)
                {
                    return ApiResponse<IEnumerable<FeedResponseDto>>.ErrorResponse(
                        "Invalid role ID", 400);
                }

                var Feeds = await _unitOfWork.Feeds.GetFeedsByCategoryAsync(categoryId);
                var FeedDtos = _mapper.Map<IEnumerable<FeedResponseDto>>(Feeds);

                return ApiResponse<IEnumerable<FeedResponseDto>>.SuccessResponse(
                    FeedDtos,
                    $"Retrieved {FeedDtos.Count()} Feeds with category ID {categoryId}");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<FeedResponseDto>>.ErrorResponse(
                    $"An error occurred while retrieving Feeds by category {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<IEnumerable<FeedContentDto>>> FetchFeedContentAsync(int feedId)
        {
            // 1. Vérification de l'existence du flux dans la base
            var feeds = await _unitOfWork.Feeds.FindAsync(f => f.Id == feedId);
            var feed = feeds.FirstOrDefault();
            if (feed == null)
                return ApiResponse<IEnumerable<FeedContentDto>>.ErrorResponse("Flux introuvable");

            // 2. Vérification du cache pour éviter les requêtes répétées
            string cacheKey = $"FeedContent_{feedId}";
            if (_cache.TryGetValue(cacheKey, out IEnumerable<FeedContentDto>? cachedItems))
                return ApiResponse<IEnumerable<FeedContentDto>>.SuccessResponse(cachedItems ?? [], "");

            try
            {
                // 3. Téléchargement du flux RSS/Atom
                var response = await _httpClient.GetAsync(feed.URL);
                response.EnsureSuccessStatusCode(); // Lève une exception si le statut HTTP est ≠ 200
                var content = await response.Content.ReadAsStringAsync();

                // 4. Parsing du flux XML
                var reader = XmlReader.Create(new StringReader(content));
                var rss = SyndicationFeed.Load(reader);

                // 5. Extraction des articles
                var items = rss.Items.Select(item => new FeedContentDto
                {
                    Title = item.Title?.Text ?? "Sans titre",
                    Link = item.Links.FirstOrDefault()?.Uri?.ToString() ?? "",
                    PublishedAt = item.PublishDate.DateTime,
                    Description = item.Summary?.Text ?? "" // Optionnel : description de l'article
                }).ToList();

                // 6. Mise en cache pour 10 minutes
                _cache.Set(cacheKey, items, TimeSpan.FromMinutes(10));

                return ApiResponse<IEnumerable<FeedContentDto>>.SuccessResponse(items, "");
            }
            catch (XmlException)
            {
                return ApiResponse<IEnumerable<FeedContentDto>>.ErrorResponse("Format de flux RSS/Atom invalide");
            }
            catch (HttpRequestException)
            {
                return ApiResponse<IEnumerable<FeedContentDto>>.ErrorResponse("Échec de la récupération du flux (URL invalide ou inaccessible)");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<FeedContentDto>>.ErrorResponse($"Erreur inattendue : {ex.Message}");
            }
        }

        public async Task<ApiResponse<int>> GetActiveCountByUserAsync(int userId)
        {
            try
            {
                var count = await _unitOfWork.Feeds.CountAsync(f => f.UserId == userId && f.IsActive);
                return ApiResponse<int>.SuccessResponse(count, "Active feeds count retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<int>.ErrorResponse($"Error retrieving active feeds count: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<IEnumerable<FeedResponseDto>>> GetRecentByUserAsync(int userId, int limit = 10)
        {
            try
            {
                var feeds = await _unitOfWork.Feeds.FindAsync(f => f.UserId == userId);
                var orderedFeeds = feeds.OrderByDescending(f => f.CreatedAt).Take(limit);
                var feedDtos = _mapper.Map<IEnumerable<FeedResponseDto>>(orderedFeeds);
                return ApiResponse<IEnumerable<FeedResponseDto>>.SuccessResponse(feedDtos, "Recent feeds retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<FeedResponseDto>>.ErrorResponse($"Error retrieving recent feeds: {ex.Message}", 500);
            }
        }
    }
}
