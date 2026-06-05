// User entity
export interface User {
    id: number;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    updatedAt?: string;
    bio?: string;
    avatar?: string;
    isActive: boolean;
    categories?: Category[];
    summaries?: Summary[];
}

// Category entity
export interface Category {
    id: number;
    name: string;
    description?: string;
    color?: string;
    createdAt: string;
    updatedAt?: string;
    userId?: number;
    user?: User;
    feeds?: Feed[];
    notes?: Note[];
    trends?: Trend[];
}

// Feed entity
export interface Feed {
    id: number;
    name: string;
    url: string;
    description?: string;
    categoryId: number;
    isActive: boolean;
    refreshIntervalMinutes: number;
    createdAt: string;
    updatedAt?: string;
    lastFetched?: string;
    category?: Category;
}

// Note entity
export interface Note {
    id: number;
    title: string;
    content: string;
    summary?: string;
    tags?: string;
    categoryId: number;
    userId: number;
    feedId?: number;
    createdAt: string;
    updatedAt?: string;
    category?: Category;
    user?: User;
    feed?: Feed;
}

// Trend entity
export interface Trend {
    id: number;
    categoryId: number;
    score: number;
    data: any; // JSON data
    generatedAt: string;
    expiresAt: string;
    category?: Category;
}

// Summary entity
export interface Summary {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    userId: number;
    trendId?: number;
    user?: User;
    trend?: Trend;
}

// DTOs for API requests/responses
export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
    color?: string;
}

export interface CreateFeedDto {
    name: string;
    url: string;
    description?: string;
    categoryId: number;
    isActive?: boolean;
    refreshIntervalMinutes?: number;
}

export interface CreateNoteDto {
    title: string;
    content: string;
    summary?: string;
    categoryId?: number;
    tags?: string;
}

export interface UpdateCategoryDto {
    name?: string;
    description?: string;
    color?: string;
}

export interface UpdateFeedDto {
    name?: string;
    url?: string;
    description?: string;
    isActive?: boolean;
    refreshIntervalMinutes?: number;
}

export interface UpdateNoteDto {
    title?: string;
    content?: string;
    summary?: string;
    categoryId?: number;
    tags?: string;
}

export interface UpdateSummaryDto {
    title?: string;
    content?: string;
    trendId?: number;
}

// Hook types
export interface ExportDataHook {
    exportToCSV: (data: any[], filename: string) => void;
    exportToJSON: (data: any[], filename: string) => void;
    exportToPDF?: (data: any[], filename: string) => void;
    exportToMarkdown?: (data: any[], filename: string) => void;
}

export interface GenerateSummaryOptions {
    length: 'short' | 'medium' | 'long';
    style: 'technical' | 'business' | 'casual';
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateProfileDto {
    username?: string;
    bio?: string;
    avatar?: string;
}

// Dashboard Stats interface
export interface DashboardStats {
    totalCategories: number;
    activeFeeds: number;
    totalNotes: number;
    trendScore: number;
    categoriesChange: number;
    feedsChange: number;
    notesChange: number;
    trendScoreChange: number;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    user: User;
    expiresAt: string;
}

// API Response wrapper - correspond exactement au backend ApiResponse<T>
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors: string[];
    validationErrors: { [key: string]: string[] };
    statusCode: number;
    timestamp: string;
    traceId: string;
}

// Pagination
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// UI State types
export interface AppState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface CategoryState {
    categories: Category[];
    selectedCategory: Category | null;
    loading: boolean;
    error: string | null;
}

export interface FeedState {
    feeds: Feed[];
    loading: boolean;
    error: string | null;
}

export interface NoteState {
    notes: Note[];
    selectedNote: Note | null;
    loading: boolean;
    error: string | null;
}

export interface TrendState {
    trends: Trend[];
    selectedTrend: Trend | null;
    loading: boolean;
    error: string | null;
}

export interface SummaryState {
    summaries: Summary[];
    selectedSummary: Summary | null;
    loading: boolean;
    error: string | null;
}
