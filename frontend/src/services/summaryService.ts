import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';
import { ApiResponse } from '../types';

export interface Summary {
  id: number;
  title: string;
  content: string;
  userId: number;
  createdAt: string;
}

class SummaryService {
  async getAll(): Promise<ApiResponse<Summary[]>> {
    return api.get<Summary[]>(API_ENDPOINTS.SUMMARY.BASE);
  }

  async getById(id: number): Promise<ApiResponse<Summary>> {
    return api.get<Summary>(`${API_ENDPOINTS.SUMMARY.BASE}/${id}`);
  }

  async getByUser(userId: number): Promise<ApiResponse<Summary[]>> {
    return api.get<Summary[]>(API_ENDPOINTS.SUMMARY.BY_USER(userId));
  }

  async getDaily(): Promise<ApiResponse<Summary[]>> {
    return api.get<Summary[]>(API_ENDPOINTS.SUMMARY.DAILY);
  }

  async getByCategory(categoryId: number): Promise<ApiResponse<Summary[]>> {
    return api.get<Summary[]>(API_ENDPOINTS.SUMMARY.BY_CATEGORY(categoryId));
  }

  async generateForCategory(categoryId: number): Promise<ApiResponse<Summary>> {
    return api.post<Summary>(API_ENDPOINTS.SUMMARY.GENERATE(categoryId));
  }

  async generateFromTrend(trendId: number): Promise<ApiResponse<Summary>> {
    return api.post<Summary>(`/Summary/trend/${trendId}/generate`);
  }

  async generate(trendId: number): Promise<ApiResponse<Summary>> {
    // Use the new trend-based endpoint
    return this.generateFromTrend(trendId);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`${API_ENDPOINTS.SUMMARY.BASE}/${id}`);
  }

  async getRecentByUser(userId: number, limit: number = 10): Promise<ApiResponse<Summary[]>> {
    return api.get<Summary[]>(`/summaries/user/${userId}/recent?limit=${limit}`);
  }
}

export const summaryService = new SummaryService();
export default summaryService;
