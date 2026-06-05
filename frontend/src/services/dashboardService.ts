import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';
import { ApiResponse } from '../types';

export interface DashboardStats {
  totalCategories: number;
  activeFeeds: number;
  totalNotes: number;
  trendAnalysisScore: number;
  categoriesChange: number;
  feedsChange: number;
  notesChange: number;
}

class DashboardService {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return api.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS);
  }

  async getRecent(): Promise<ApiResponse<any>> {
    return api.get(API_ENDPOINTS.DASHBOARD.ACTIVITY);
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
