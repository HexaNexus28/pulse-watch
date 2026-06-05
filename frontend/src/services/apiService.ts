import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import {
  CreateUserDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateFeedDto,
  UpdateFeedDto,
  CreateNoteDto,
  UpdateNoteDto
} from '../types';

// Types de réponse du backend
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

// Types des entités
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  userId?: number;
}

export interface Feed {
  id: number;
  url: string;
  name: string;
  categoryId: number;
  createdAt: string;
  isActive: boolean;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  createdAt: string;
}

export interface Trend {
  id: number;
  categoryId: number;
  score: number;
  data: Record<string, number>;
  generatedAt: string;
}

export interface Summary {
  id: number;
  title: string;
  content: string;
  generatedAt: string;
  trendId: number;
  userId?: number;
}

export interface DashboardStats {
  totalCategories: number;
  activeFeeds: number;
  totalNotes: number;
  trendAnalysisScore: number;
  categoriesChange: number;
  feedsChange: number;
  notesChange: number;
}

// Service API de base
class ApiService {
  private baseUrl = API_CONFIG.BASE_URL;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        ...API_CONFIG.HEADERS,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`,
          statusCode: response.status,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        statusCode: 500,
      };
    }
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS);
  }

  async getDashboardActivity(): Promise<ApiResponse<any>> {
    return this.request(API_ENDPOINTS.DASHBOARD.ACTIVITY);
  }

  // Categories
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>(API_ENDPOINTS.CATEGORY.BASE);
  }

  async getCategoryById(id: number): Promise<ApiResponse<Category>> {
    return this.request<Category>(API_ENDPOINTS.CATEGORY.BY_ID(id));
  }

  async createCategory(category: CreateCategoryDto): Promise<ApiResponse<Category>> {
    return this.request<Category>(API_ENDPOINTS.CATEGORY.CREATE, {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: number, category: UpdateCategoryDto): Promise<ApiResponse<Category>> {
    return this.request<Category>(API_ENDPOINTS.CATEGORY.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.CATEGORY.DELETE(id), {
      method: 'DELETE',
    });
  }

  // Feeds
  async getAllFeeds(): Promise<ApiResponse<Feed[]>> {
    return this.request<Feed[]>(API_ENDPOINTS.FEED.BASE);
  }

  async getFeedById(id: number): Promise<ApiResponse<Feed>> {
    return this.request<Feed>(API_ENDPOINTS.FEED.BY_ID(id));
  }

  async getFeedsByCategory(categoryId: number): Promise<ApiResponse<Feed[]>> {
    return this.request<Feed[]>(API_ENDPOINTS.FEED.BY_CATEGORY(categoryId));
  }

  async createFeed(feed: CreateFeedDto): Promise<ApiResponse<Feed>> {
    return this.request<Feed>(API_ENDPOINTS.FEED.CREATE, {
      method: 'POST',
      body: JSON.stringify(feed),
    });
  }

  async updateFeed(id: number, feed: UpdateFeedDto): Promise<ApiResponse<Feed>> {
    return this.request<Feed>(API_ENDPOINTS.FEED.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(feed),
    });
  }

  async deleteFeed(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.FEED.DELETE(id), {
      method: 'DELETE',
    });
  }

  // Notes
  async getAllNotes(): Promise<ApiResponse<Note[]>> {
    return this.request<Note[]>(API_ENDPOINTS.NOTE.BASE);
  }

  async getNoteById(id: number): Promise<ApiResponse<Note>> {
    return this.request<Note>(API_ENDPOINTS.NOTE.BY_ID(id));
  }

  async createNote(note: CreateNoteDto): Promise<ApiResponse<Note>> {
    return this.request<Note>(API_ENDPOINTS.NOTE.CREATE, {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async updateNote(id: number, note: UpdateNoteDto): Promise<ApiResponse<Note>> {
    return this.request<Note>(API_ENDPOINTS.NOTE.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(note),
    });
  }

  async deleteNote(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.NOTE.DELETE(id), {
      method: 'DELETE',
    });
  }

  async getNotesByCategory(categoryId: number): Promise<ApiResponse<Note[]>> {
    return this.request<Note[]>(API_ENDPOINTS.CATEGORY.NOTES(categoryId));
  }

  // Trends
  async getAllTrends(): Promise<ApiResponse<Trend[]>> {
    return this.request<Trend[]>(API_ENDPOINTS.TREND.BASE);
  }

  async getTrendById(id: number): Promise<ApiResponse<Trend>> {
    return this.request<Trend>(API_ENDPOINTS.TREND.BY_ID(id));
  }

  async getTrendsByCategory(categoryId: number): Promise<ApiResponse<Trend[]>> {
    return this.request<Trend[]>(API_ENDPOINTS.TREND.BY_CATEGORY(categoryId));
  }

  async getLatestTrendByCategory(categoryId: number): Promise<ApiResponse<Trend>> {
    return this.request<Trend>(API_ENDPOINTS.TREND.LATEST(categoryId));
  }

  async generateTrendForCategory(categoryId: number): Promise<ApiResponse<Trend>> {
    return this.request<Trend>(API_ENDPOINTS.TREND.GENERATE(categoryId), {
      method: 'POST',
    });
  }

  // Summaries
  async getAllSummaries(): Promise<ApiResponse<Summary[]>> {
    return this.request<Summary[]>(API_ENDPOINTS.SUMMARY.BASE);
  }

  async getSummaryById(id: number): Promise<ApiResponse<Summary>> {
    return this.request<Summary>(API_ENDPOINTS.SUMMARY.BY_ID(id));
  }

  async getSummariesByUser(userId: number): Promise<ApiResponse<Summary[]>> {
    return this.request<Summary[]>(API_ENDPOINTS.SUMMARY.BY_USER(userId));
  }

  async getDailySummaries(): Promise<ApiResponse<Summary[]>> {
    return this.request<Summary[]>(API_ENDPOINTS.SUMMARY.DAILY);
  }

  async getSummariesByCategory(categoryId: number): Promise<ApiResponse<Summary[]>> {
    return this.request<Summary[]>(API_ENDPOINTS.SUMMARY.BY_CATEGORY(categoryId));
  }

  async generateSummaryForCategory(categoryId: number): Promise<ApiResponse<Summary>> {
    return this.request<Summary>(API_ENDPOINTS.SUMMARY.GENERATE(categoryId), {
      method: 'POST',
    });
  }

  // Users
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>(API_ENDPOINTS.USER.BASE);
  }

  async getUserById(id: number): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USER.BY_ID(id));
  }

  async createUser(user: CreateUserDto): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: number, user: { username?: string; email?: string }): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USER.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.USER.DELETE(id), {
      method: 'DELETE',
    });
  }

  // Auth
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; refreshToken: string; expiration: string }>> {
    return this.request(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: { username: string; email: string; password: string }): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
