import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';
import { ApiResponse } from '../types';

export interface Trend {
  id: number;
  categoryId: number;
  score: number;
  data: Record<string, number>;
  generatedAt: string;
  expiresAt: string;
}

class TrendService {
  async getAll(): Promise<ApiResponse<Trend[]>> {
    return api.get<Trend[]>(API_ENDPOINTS.TREND.BASE);
  }

  async getById(id: number): Promise<ApiResponse<Trend>> {
    return api.get<Trend>(`${API_ENDPOINTS.TREND.BASE}/${id}`);
  }

  async getByCategory(categoryId: number): Promise<ApiResponse<Trend[]>> {
    return api.get<Trend[]>(API_ENDPOINTS.TREND.BY_CATEGORY(categoryId));
  }

  async getLatestByCategory(categoryId: number): Promise<ApiResponse<Trend>> {
    return api.get<Trend>(API_ENDPOINTS.TREND.LATEST(categoryId));
  }

  async generateForCategory(categoryId: number): Promise<ApiResponse<Trend>> {
    return api.post<Trend>(API_ENDPOINTS.TREND.GENERATE(categoryId));
  }

  async detectTrends(categoryId: number): Promise<ApiResponse<Trend[]>> {
    return api.post<Trend[]>(API_ENDPOINTS.TREND.DETECT(categoryId));
  }
}

export const trendService = new TrendService();
export default trendService;
