// Services
export { dashboardService } from './dashboardService';
export { categoryService } from './categoryService';
export { feedService } from './feedService';
export { noteService } from './noteService';
export { trendService } from './trendService';
export { summaryService } from './summaryService';
export { userService } from './userService';

// Types
export type { DashboardStats } from './dashboardService';
export type { Category } from './categoryService';
export type { Feed } from '../types';
export type { Note } from '../types';
export type { Trend } from './trendService';
export type { Summary } from './summaryService';
export type {
    User,
    CreateUserDto,
    UpdateUserDto,
    LoginCredentials,
    AuthResponse
} from './userService';

// DTOs from types
export type {
    CreateCategoryDto,
    UpdateCategoryDto,
    CreateFeedDto,
    UpdateFeedDto,
    CreateNoteDto,
    UpdateNoteDto
} from '../types';

// Common types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    statusCode?: number;
}
