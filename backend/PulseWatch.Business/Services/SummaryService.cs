using AutoMapper;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Dtos.Response;
using PulseWatch.Core.Entities;
using PulseWatch.Core.Interfaces.Repositories;
using PulseWatch.Core.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace PulseWatch.Business.Services
{
    public class SummaryService : ISummaryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<SummaryService> _logger;
        private readonly IFeedService _feedService;
        private readonly IDigestGenerator _digestGenerator;

        public SummaryService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<SummaryService> logger,
            IFeedService feedService,
            IDigestGenerator digestGenerator)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _feedService = feedService ?? throw new ArgumentNullException(nameof(feedService));
            _digestGenerator = digestGenerator ?? throw new ArgumentNullException(nameof(digestGenerator));
        }


        public async Task<ApiResponse<SummaryResponseDto>> GetSummaryByIdAsync(int id) {
            try
            {
                if (id <= 0)
                {
                    return ApiResponse<SummaryResponseDto>.ErrorResponse(
                        "Invalid Summary ID", 400);
                }

                var summary = await _unitOfWork.Summaries.GetByIdAsync(id);

                if (summary == null)
                {
                    return ApiResponse<SummaryResponseDto>.NotFoundResponse(
                        $"Summary with ID {id} not found");
                }

                var summaryDto = _mapper.Map<SummaryResponseDto>(summary);
                return ApiResponse<SummaryResponseDto>.SuccessResponse(
                    summaryDto,
                    "Summary retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<SummaryResponseDto>.ErrorResponse(
                    "An error occurred while retrieving the summary ", 500);
            }
        }

        /// <summary>
        /// Récupère tous les résumés
        /// </summary>
        public async Task<ApiResponse<IEnumerable<SummaryResponseDto>>> GetAllSummariesAsync()
        
        {
            try
            {
                var Summaries = await _unitOfWork.Summaries.GetAllAsync();
                var SummaryDtos = _mapper.Map<IEnumerable<SummaryResponseDto>>(Summaries);

                return ApiResponse<IEnumerable<SummaryResponseDto>>.SuccessResponse(
                    SummaryDtos,
                    $"Retrieved {SummaryDtos.Count()} active Summarys");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<SummaryResponseDto>>.ErrorResponse(
                    $"An error occurred while retrieving Summarys{ex.Message}", 500);
            }
        }



        /// <summary>
        /// Récupère les résumés d'un utilisateur
        /// </summary>
        public async Task<ApiResponse<IEnumerable<SummaryResponseDto>>> GetUserSummariesAsync(int userId) 
        {
            try
            {
                var Summaries = await _unitOfWork.Summaries.GetSummariesByUserAsync(userId);
                var SummaryDtos = _mapper.Map<IEnumerable<SummaryResponseDto>>(Summaries);

                return ApiResponse<IEnumerable<SummaryResponseDto>>.SuccessResponse(
                    SummaryDtos,
                    $"Retrieved {SummaryDtos.Count()} active Summarys");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<SummaryResponseDto>>.ErrorResponse(
                    $"An error occurred while retrieving Summarys{ex.Message}", 500);
            }
            
        }

        /// <summary>
        /// Supprime un summary
        /// </summary>
        public async Task<ApiResponse<bool>> DeleteSummaryAsync(int id) 
        {
            try
            {
                if (id <= 0)
                {
                    return ApiResponse<bool>.ErrorResponse(
                        "Invalid Summary ID", 400);
                }

                var Summary = await _unitOfWork.Summaries.GetByIdAsync(id);

                if (Summary == null)
                {
                    return ApiResponse<bool>.NotFoundResponse(
                        $"Summary with ID {id} not found");
                }

                // Soft delete
                Summary = null;

                _unitOfWork.Summaries.Update(Summary);
                await _unitOfWork.SaveChangesAsync();


                return ApiResponse<bool>.SuccessResponse(
                    true,
                    "Summary deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResponse(
                    $"An error occurred while deleting the Summary {ex.Message}", 500);
            }
        }
        public async Task<ApiResponse<SummaryResponseDto>> GenerateSummaryAsync(int trendId, int userId)
        {
            // 1. Récupérer le trend avec sa catégorie
            var trend = await _unitOfWork.Trends.GetTrendWithCategoryAsync(trendId);

            if (trend == null)
                return ApiResponse<SummaryResponseDto>.ErrorResponse("Trend not found");

            // 2. Récupérer les feeds de la catégorie du trend
            var feeds = await _unitOfWork.Feeds.GetFeedsByCategoryAsync(trend.CategoryId);
            if (!feeds.Any())
                return ApiResponse<SummaryResponseDto>.ErrorResponse("No feeds found for this category");

            // 3. Récupérer le contenu des articles RSS
            var articleContents = await CollectArticlesAsync(feeds);

            if (articleContents.Count < MinArticlesForDigest)
                return ApiResponse<SummaryResponseDto>.ErrorResponse(NotEnoughArticlesMessage(articleContents.Count), 422);

            // 4. Générer un résumé basé sur le contenu réel des articles
            var summaryContent = await GenerateContentSummaryAsync(articleContents, trend.Category.Name);

            // 5. Créer le résumé en base
            if (userId == 0)
                return ApiResponse<SummaryResponseDto>.ErrorResponse("User not authenticated", 401);

            var summary = new Summary
            {
                TrendId = trendId,
                // Renseignee aussi sur ce chemin : la categorie se lit alors de la
                // meme facon quelle que soit l'origine du resume.
                CategoryId = trend.CategoryId,
                Title = $"Actualités {trend.Category.Name} : {DateTime.UtcNow:dd/MM/yyyy}",
                Content = summaryContent,
                GeneratedAt = DateTime.UtcNow,
                UserId = userId
            };

            await _unitOfWork.Summaries.AddAsync(summary);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Summary generated successfully for trend {TrendId} with {ArticleCount} articles", 
                trendId, articleContents.Count);

            // 6. Retourner la réponse
            var responseDto = new SummaryResponseDto
            {
                Id = summary.Id,
                Title = summary.Title,
                Content = summary.Content,
                UserId = summary.UserId,
                TrendId = summary.TrendId,
                GeneratedAt = summary.GeneratedAt,
                CategoryName = trend.Category.Name
            };

            return ApiResponse<SummaryResponseDto>.SuccessResponse(responseDto, "Summary generated successfully");
        }

        /// <summary>
        /// Fenetre d'articles acceptee par l'agent : DigestRequest, dans
        /// agent/digest_agent/service.py, declare articles avec min_length=5 et
        /// max_length=40. Sous le plancher il n'y a rien a dedupliquer, au-dessus
        /// du plafond le contexte du curateur explose.
        /// </summary>
        /// <remarks>
        /// Ces bornes sont validees par l'agent, qui repond 422 quand elles ne
        /// sont pas tenues. Les faire respecter ici est ce qui distingue un
        /// message metier lisible d'un 500 opaque : une categorie a 4 articles,
        /// ou 5 flux rendant 10 articles chacun, sont deux situations ordinaires.
        ///
        /// Elles sont dupliquees des deux cotes de HTTP faute d'un schema
        /// partage. Toute modification de DigestRequest doit passer ici.
        /// </remarks>
        private const int MinArticlesForDigest = 5;
        private const int MaxArticlesForDigest = 40;

        /// <summary>Nombre d'articles lus par flux, plafonne comme avant a 10.</summary>
        private const int MaxArticlesPerFeed = 10;

        private static string NotEnoughArticlesMessage(int found) =>
            $"Not enough article content to generate a digest: {found} article(s) available, "
            + $"{MinArticlesForDigest} required. Add feeds to this category, or wait for new articles.";

        /// <summary>
        /// Rassemble les articles des flux d'une categorie, dans la fenetre que
        /// l'agent accepte.
        /// </summary>
        /// <remarks>
        /// Le plafond est reparti entre les flux plutot qu'applique par une
        /// troncature finale : tronquer ferait disparaitre les derniers flux
        /// entierement, et le digest presenterait une categorie en n'ayant lu
        /// qu'une partie de ses sources sans que rien ne le signale.
        ///
        /// Un flux injoignable est journalise et saute : perdre une source ne
        /// doit pas faire perdre les autres.
        /// </remarks>
        private async Task<List<(string Title, string Content, string Url, string Source)>> CollectArticlesAsync(
            IEnumerable<Feed> feeds)
        {
            var feedList = feeds.ToList();
            var articles = new List<(string Title, string Content, string Url, string Source)>();

            var perFeed = Math.Clamp(MaxArticlesForDigest / Math.Max(1, feedList.Count), 1, MaxArticlesPerFeed);

            foreach (var feed in feedList)
            {
                try
                {
                    var feedContentResult = await _feedService.FetchFeedContentAsync(feed.Id);
                    if (feedContentResult.Success && feedContentResult.Data != null)
                    {
                        foreach (var article in feedContentResult.Data.Take(perFeed))
                        {
                            if (!string.IsNullOrWhiteSpace(article.Description))
                            {
                                articles.Add((
                                    article.Title,
                                    article.Description,
                                    article.Link,
                                    feed.Name
                                ));
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to fetch content for feed {FeedId}", feed.Id);
                }
            }

            // perFeed * nombre de flux peut depasser le plafond quand la division
            // ne tombe pas juste (41 flux a 1 article, par exemple).
            if (articles.Count > MaxArticlesForDigest)
            {
                _logger.LogInformation(
                    "Digest input capped at {Max} articles out of {Total} collected",
                    MaxArticlesForDigest, articles.Count);
                articles = articles.Take(MaxArticlesForDigest).ToList();
            }

            return articles;
        }

        /// <summary>
        /// Envoie les articles a l'agent ADK et rend le digest en markdown.
        /// </summary>
        /// <remarks>
        /// Remplace l'ancien GenerateContentSummaryAsync, qui n'etait pas un
        /// resume : il decoupait chaque article en phrases, comptait les mots de
        /// plus de 4 lettres et recollait 6 phrases brutes. Aucune synthese,
        /// aucune deduplication, aucune verification des sources.
        ///
        /// Pas de repli silencieux vers l'ancien comportement en cas de panne de
        /// l'agent : un faux resume rendu sans erreur masquerait la panne pendant
        /// des semaines. L'exception remonte et l'appelant repond en erreur.
        /// </remarks>
        private async Task<string> GenerateContentSummaryAsync(
            List<(string Title, string Content, string Url, string Source)> articles,
            string categoryName,
            CancellationToken cancellationToken = default)
        {
            var payload = articles
                .Select(a => new DigestArticleDto
                {
                    Title = a.Title,
                    Excerpt = a.Content,
                    Url = a.Url,
                    Source = a.Source,
                })
                .ToList();

            var digest = await _digestGenerator.GenerateAsync(categoryName, payload, cancellationToken);

            _logger.LogInformation(
                "Digest agent kept {Kept} stories out of {Total} articles for {Category}",
                digest.Items.Count, articles.Count, categoryName);

            return RenderDigest(digest, articles.Count);
        }

        /// <summary>
        /// Markdown stocke dans Summary.Content. Le rendu vit ici et non dans
        /// l'agent : l'agent renvoie une structure, la mise en forme est une
        /// decision de presentation qui appartient a l'application.
        /// </summary>
        private static string RenderDigest(DigestDto digest, int articleCount)
        {
            var builder = new StringBuilder();
            builder.AppendLine($"**{digest.Category}** - {digest.Items.Count} sujets retenus sur {articleCount} articles ({digest.DroppedCount} ecartes)");
            builder.AppendLine();

            foreach (var item in digest.Items)
            {
                builder.AppendLine($"### {item.Headline}");
                builder.AppendLine(item.WhyItMatters);
                foreach (var source in item.Sources)
                {
                    builder.AppendLine($"- {source}");
                }
                builder.AppendLine();
            }

            return builder.ToString();
        }

        public async Task<ApiResponse<IEnumerable<SummaryResponseDto>>> GetRecentByUserAsync(int userId, int limit = 10)
        {
            try
            {
                var summaries = await _unitOfWork.Summaries.FindAsync(s => s.UserId == userId);
                var orderedSummaries = summaries.OrderByDescending(s => s.GeneratedAt).Take(limit);
                var summaryDtos = _mapper.Map<IEnumerable<SummaryResponseDto>>(orderedSummaries);
                return ApiResponse<IEnumerable<SummaryResponseDto>>.SuccessResponse(summaryDtos, "Recent summaries retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<SummaryResponseDto>>.ErrorResponse($"Error retrieving recent summaries: {ex.Message}", 500);
            }
        }

        // Méthodes supplémentaires pour le controller
        public async Task<ApiResponse<IEnumerable<SummaryResponseDto>>> GetSummariesByUserAsync(int userId)
        {
            _logger.LogInformation("Début de GetSummariesByUserAsync pour userId: {UserId}", userId);
            
            try
            {
                var summaries = await _unitOfWork.Summaries.FindAsync(s => s.UserId == userId);
                var summaryDtos = _mapper.Map<IEnumerable<SummaryResponseDto>>(summaries);
                return ApiResponse<IEnumerable<SummaryResponseDto>>.SuccessResponse(summaryDtos, "User summaries retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des summaries pour userId: {UserId}", userId);
                return ApiResponse<IEnumerable<SummaryResponseDto>>.ErrorResponse($"Error retrieving user summaries: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<IEnumerable<SummaryResponseDto>>> GetDailySummariesAsync()
        {
            _logger.LogInformation("Début de GetDailySummariesAsync");
            
            try
            {
                var today = DateTime.UtcNow.Date;
                var summaries = await _unitOfWork.Summaries.FindAsync(s => s.GeneratedAt.Date == today);
                var summaryDtos = _mapper.Map<IEnumerable<SummaryResponseDto>>(summaries);
                return ApiResponse<IEnumerable<SummaryResponseDto>>.SuccessResponse(summaryDtos, "Daily summaries retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des daily summaries");
                return ApiResponse<IEnumerable<SummaryResponseDto>>.ErrorResponse($"Error retrieving daily summaries: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<IEnumerable<SummaryResponseDto>>> GetSummariesByCategoryAsync(int categoryId)
        {
            _logger.LogInformation("Début de GetSummariesByCategoryAsync pour categoryId: {CategoryId}", categoryId);
            
            try
            {
                // Les deux rattachements comptent : CategoryId pour les resumes qui
                // le portent, le trend pour les lignes anterieures a cette colonne.
                // Filtrer sur le seul s.Trend.CategoryId excluait tous les digests
                // de categorie, dont le TrendId est null — c'est-a-dire exactement
                // ceux que cet endpoint doit rendre.
                var summaries = await _unitOfWork.Summaries.FindAsync(
                    s => s.CategoryId == categoryId
                         || (s.CategoryId == null && s.Trend != null && s.Trend.CategoryId == categoryId));
                var summaryDtos = _mapper.Map<IEnumerable<SummaryResponseDto>>(summaries);
                return ApiResponse<IEnumerable<SummaryResponseDto>>.SuccessResponse(summaryDtos, "Category summaries retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des summaries pour categoryId: {CategoryId}", categoryId);
                return ApiResponse<IEnumerable<SummaryResponseDto>>.ErrorResponse($"Error retrieving category summaries: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<SummaryResponseDto>> GenerateSummaryForCategoryAsync(int categoryId, int userId)
        {
            _logger.LogInformation("Début de GenerateSummaryForCategoryAsync pour categoryId: {CategoryId}", categoryId);
            
            try
            {
                // 1. Récupérer la catégorie
                var category = await _unitOfWork.Categories.GetByIdAsync(categoryId);
                if (category == null)
                    return ApiResponse<SummaryResponseDto>.ErrorResponse("Category not found", 404);

                // 2. Récupérer les feeds de cette catégorie
                var feeds = await _unitOfWork.Feeds.GetFeedsByCategoryAsync(categoryId);
                if (!feeds.Any())
                    return ApiResponse<SummaryResponseDto>.ErrorResponse("No feeds found for this category", 404);

                // 3. Récupérer le contenu des articles RSS (même logique que GenerateSummaryAsync)
                var articleContents = await CollectArticlesAsync(feeds);

                if (articleContents.Count < MinArticlesForDigest)
                    return ApiResponse<SummaryResponseDto>.ErrorResponse(NotEnoughArticlesMessage(articleContents.Count), 422);

                // 4. Générer un résumé basé sur le contenu réel des articles
                var summaryContent = await GenerateContentSummaryAsync(articleContents, category.Name);

                // 5. Créer le résumé en base (sans trendId spécifique)
                if (userId == 0)
                    return ApiResponse<SummaryResponseDto>.ErrorResponse("User not authenticated", 401);

                var summary = new Summary
                {
                    Title = $"Actualités {category.Name} : {DateTime.UtcNow:dd/MM/yyyy}",
                    Content = summaryContent,
                    GeneratedAt = DateTime.UtcNow,
                    UserId = userId,
                    TrendId = null, // Pas lié à un trend spécifique, mais à la catégorie
                    CategoryId = categoryId
                };

                await _unitOfWork.Summaries.AddAsync(summary);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Category summary generated successfully for categoryId {CategoryId} with {ArticleCount} articles", 
                    categoryId, articleContents.Count);

                // 6. Retourner la réponse
                var summaryDto = new SummaryResponseDto
                {
                    Id = summary.Id,
                    Title = summary.Title,
                    Content = summary.Content,
                    UserId = summary.UserId,
                    TrendId = summary.TrendId,
                    GeneratedAt = summary.GeneratedAt,
                    CategoryName = category.Name
                };

                return ApiResponse<SummaryResponseDto>.SuccessResponse(summaryDto, "Category summary generated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la génération du summary pour categoryId: {CategoryId}", categoryId);
                return ApiResponse<SummaryResponseDto>.ErrorResponse($"Error generating summary: {ex.Message}", 500);
            }
        }

       }
}
