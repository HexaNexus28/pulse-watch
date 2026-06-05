import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';
import { CreateCategoryDto, UpdateCategoryDto, ApiResponse } from '../types';

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  userId?: number;
}

class CategoryService {
  async getAll(): Promise<ApiResponse<Category[]>> {
    return api.get<Category[]>(API_ENDPOINTS.CATEGORY.BASE);
  }

  async getById(id: number): Promise<ApiResponse<Category>> {
    return api.get<Category>(`${API_ENDPOINTS.CATEGORY.BASE}/${id}`);
  }

  async create(category: CreateCategoryDto): Promise<ApiResponse<Category>> {
    return api.post<Category>(API_ENDPOINTS.CATEGORY.BASE, category);
  }

  async update(id: number, category: UpdateCategoryDto): Promise<ApiResponse<Category>> {
    return api.put<Category>(`${API_ENDPOINTS.CATEGORY.BASE}/${id}`, category);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`${API_ENDPOINTS.CATEGORY.BASE}/${id}`);
  }
}

export const categoryService = new CategoryService();
export default categoryService;
