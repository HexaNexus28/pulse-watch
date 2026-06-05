import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';
import { CreateFeedDto, UpdateFeedDto, ApiResponse, Feed } from '../types';

class FeedService {
  async getAll(): Promise<ApiResponse<Feed[]>> {
    return api.get<Feed[]>(API_ENDPOINTS.FEED.BASE);
  }

  async getById(id: number): Promise<ApiResponse<Feed>> {
    return api.get<Feed>(`${API_ENDPOINTS.FEED.BASE}/${id}`);
  }

  async getByCategory(categoryId: number): Promise<ApiResponse<Feed[]>> {
    return api.get<Feed[]>(API_ENDPOINTS.FEED.BY_CATEGORY(categoryId));
  }

  async create(feed: CreateFeedDto): Promise<ApiResponse<Feed>> {
    return api.post<Feed>(API_ENDPOINTS.FEED.CREATE, feed);
  }

  async update(id: number, feed: UpdateFeedDto): Promise<ApiResponse<Feed>> {
    return api.put<Feed>(API_ENDPOINTS.FEED.UPDATE(id), feed);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(API_ENDPOINTS.FEED.DELETE(id));
  }

  async fetch(id: number): Promise<ApiResponse<any>> {
    return api.post(API_ENDPOINTS.FEED.FETCH(id));
  }
}

export const feedService = new FeedService();
export default feedService;
