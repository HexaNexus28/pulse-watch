using AutoMapper;
using PulseWatch.Core.Dtos.Request;
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
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CategoryService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<ApiResponse<CategoryResponseDto>> GetCategoryByIdAsync(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return ApiResponse<CategoryResponseDto>.ErrorResponse(
                        "Invalid Category ID", 400);
                }

                var category = await _unitOfWork.Categories.GetByIdAsync(id);

                if (category == null)
                {
                    return ApiResponse<CategoryResponseDto>.NotFoundResponse(
                        $"Category with ID {id} not found");
                }

                var categoryDto = _mapper.Map<CategoryResponseDto>(category);
                return ApiResponse<CategoryResponseDto>.SuccessResponse(
                    categoryDto,
                    "Category retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<CategoryResponseDto>.ErrorResponse(
                    $"An error occurred while retrieving category: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<IEnumerable<CategoryResponseDto>>> GetAllCategoriesAsync()
        {
            try
            {
                var categories = await _unitOfWork.Categories.GetAllAsync();
                var categoryDtos = _mapper.Map<IEnumerable<CategoryResponseDto>>(categories);
                
                return ApiResponse<IEnumerable<CategoryResponseDto>>.SuccessResponse(
                    categoryDtos,
                    "Categories retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<CategoryResponseDto>>.ErrorResponse(
                    $"An error occurred while retrieving categories: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<CategoryResponseDto>> CreateCategoryAsync(CreateCategoryDto createCategoryDto)
        {
            try
            {
                if (createCategoryDto == null || string.IsNullOrWhiteSpace(createCategoryDto.Name))
                {
                    return ApiResponse<CategoryResponseDto>.ErrorResponse(
                        "Invalid category data", 400);
                }

                var category = _mapper.Map<Category>(createCategoryDto);
                var createdCategory = await _unitOfWork.Categories.AddAsync(category);

                var categoryDto = _mapper.Map<CategoryResponseDto>(createdCategory);
                return ApiResponse<CategoryResponseDto>.SuccessResponse(
                    categoryDto,
                    "Category created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<CategoryResponseDto>.ErrorResponse(
                    $"An error occurred while creating category: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<CategoryResponseDto>> UpdateCategoryAsync(int id, UpdateCategoryDto updateCategoryDto)
        {
            try
            {
                if (id <= 0)
                {
                    return ApiResponse<CategoryResponseDto>.ErrorResponse(
                        "Invalid Category ID", 400);
                }

                var existingCategory = await _unitOfWork.Categories.GetByIdAsync(id);
                if (existingCategory == null)
                {
                    return ApiResponse<CategoryResponseDto>.NotFoundResponse(
                        $"Category with ID {id} not found");
                }

                _mapper.Map(updateCategoryDto, existingCategory);
                _unitOfWork.Categories.Update(existingCategory);
                await _unitOfWork.SaveChangesAsync();

                var categoryDto = _mapper.Map<CategoryResponseDto>(existingCategory);
                return ApiResponse<CategoryResponseDto>.SuccessResponse(
                    categoryDto,
                    "Category updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<CategoryResponseDto>.ErrorResponse(
                    $"An error occurred while updating category: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<bool>> DeleteCategoryAsync(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return ApiResponse<bool>.ErrorResponse(
                        "Invalid Category ID", 400);
                }

                var existingCategory = await _unitOfWork.Categories.GetByIdAsync(id);
                if (existingCategory == null)
                {
                    return ApiResponse<bool>.NotFoundResponse(
                        $"Category with ID {id} not found");
                }

                _unitOfWork.Categories.Remove(existingCategory);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse<bool>.SuccessResponse(
                    true,
                    "Category deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResponse(
                    $"An error occurred while deleting category: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<IEnumerable<NoteResponseDto>>> GetCategoryNotesAsync(int categoryId)
        {
            try
            {
                var notes = await _unitOfWork.Notes.FindAsync(n => n.CategoryId == categoryId);
                var noteDtos = _mapper.Map<IEnumerable<NoteResponseDto>>(notes);
                
                return ApiResponse<IEnumerable<NoteResponseDto>>.SuccessResponse(
                    noteDtos,
                    "Category notes retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<NoteResponseDto>>.ErrorResponse(
                    $"An error occurred while retrieving category notes: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<IEnumerable<FeedResponseDto>>> GetCategoryFeedsAsync(int categoryId)
        {
            try
            {
                var feeds = await _unitOfWork.Feeds.FindAsync(f => f.CategoryId == categoryId);
                var feedDtos = _mapper.Map<IEnumerable<FeedResponseDto>>(feeds);
                
                return ApiResponse<IEnumerable<FeedResponseDto>>.SuccessResponse(
                    feedDtos,
                    "Category feeds retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<FeedResponseDto>>.ErrorResponse(
                    $"An error occurred while retrieving category feeds: {ex.Message}", 500);
            }
        }

        public async Task<ApiResponse<IEnumerable<TrendResponseDto>>> GetCategoryTrendsAsync(int categoryId)
        {
            try
            {
                var trends = await _unitOfWork.Trends.FindAsync(t => t.CategoryId == categoryId);
                var trendDtos = _mapper.Map<IEnumerable<TrendResponseDto>>(trends);
                
                return ApiResponse<IEnumerable<TrendResponseDto>>.SuccessResponse(
                    trendDtos,
                    "Category trends retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<TrendResponseDto>>.ErrorResponse(
                    $"An error occurred while retrieving category trends: {ex.Message}", 500);
            }
        }

        // Dashboard methods
        public async Task<int> GetCountByUserAsync(int userId)
        {
            // TODO: Implement user filtering
            return await _unitOfWork.Categories.CountAsync();
        }

        public async Task<IEnumerable<dynamic>> GetTopCategoriesByUserAsync(int userId, int limit)
        {
            // TODO: Implement user filtering and ranking
            var categories = await _unitOfWork.Categories.GetAllAsync();
            return categories.Take(limit).Select(c => new
            {
                Id = c.Id,
                Name = c.Name,
                Count = c.Feeds?.Count() + c.Notes?.Count() ?? 0,
                Trend = "+12%" // TODO: Calculate actual trend
            });
        }
    }
}
