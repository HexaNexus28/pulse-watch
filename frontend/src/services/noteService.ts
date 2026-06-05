import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';
import { CreateNoteDto, UpdateNoteDto, ApiResponse, Note } from '../types';

class NoteService {
  async getAll(): Promise<ApiResponse<Note[]>> {
    return api.get<Note[]>(API_ENDPOINTS.NOTE.BASE);
  }

  async getById(id: number): Promise<ApiResponse<Note>> {
    return api.get<Note>(`${API_ENDPOINTS.NOTE.BASE}/${id}`);
  }

  async create(note: CreateNoteDto): Promise<ApiResponse<Note>> {
    return api.post<Note>(API_ENDPOINTS.NOTE.BASE, note);
  }

  async update(id: number, note: UpdateNoteDto): Promise<ApiResponse<Note>> {
    return api.put<Note>(`${API_ENDPOINTS.NOTE.BASE}/${id}`, note);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`${API_ENDPOINTS.NOTE.BASE}/${id}`);
  }

  async getByCategory(categoryId: number): Promise<ApiResponse<Note[]>> {
    return api.get<Note[]>(API_ENDPOINTS.CATEGORY.NOTES(categoryId));
  }
}

export const noteService = new NoteService();
export default noteService;
