// API Configuration for PulseWatch Frontend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7171/api';

export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/Auth/login',
        REGISTER: '/Auth/register',
        REFRESH: '/Auth/refresh',
        LOGOUT: '/Auth/logout',
        VALIDATE: '/Auth/validate',
    },

    // Users
    USER: {
        BASE: '/User',
        BY_ID: (id: number) => `/User/${id}`,
        UPDATE: (id: number) => `/User/${id}`,
        DELETE: (id: number) => `/User/${id}`,
        CHANGE_PASSWORD: (id: number) => `/User/${id}/change-password`,
        CATEGORIES: (id: number) => `/User/${id}/categories`,
        CHECK_EMAIL: (email: string) => `/User/check-email/${email}`,
        CHECK_USERNAME: (username: string) => `/User/check-username/${username}`,
    },

    // Categories
    CATEGORY: {
        BASE: '/Category',
        BY_ID: (id: number) => `/Category/${id}`,
        CREATE: '/Category',
        UPDATE: (id: number) => `/Category/${id}`,
        DELETE: (id: number) => `/Category/${id}`,
        NOTES: (id: number) => `/Category/${id}/notes`,
        FEEDS: (id: number) => `/Category/${id}/feeds`,
        TRENDS: (id: number) => `/Category/${id}/trends`,
    },

    // Feeds
    FEED: {
        BASE: '/Feed',
        BY_ID: (id: number) => `/Feed/${id}`,
        CREATE: '/Feed',
        UPDATE: (id: number) => `/Feed/${id}`,
        DELETE: (id: number) => `/Feed/${id}`,
        FETCH: (id: number) => `/Feed/${id}/fetch`,
        BY_CATEGORY: (categoryId: number) => `/Feed/category/${categoryId}`,
        ACTIVE_COUNT_BY_USER: (userId: number) => `/Feed/user/${userId}/active/count`,
        RECENT_BY_USER: (userId: number, limit?: number) => {
            const base = `/Feed/user/${userId}/recent`;
            return limit ? `${base}?limit=${limit}` : base;
        },
    },

    // Notes
    NOTE: {
        BASE: '/Note',
        BY_ID: (id: number) => `/Note/${id}`,
        CREATE: '/Note',
        UPDATE: (id: number) => `/Note/${id}`,
        DELETE: (id: number) => `/Note/${id}`,
    },

    // Trends
    TREND: {
        BASE: '/Trend',
        BY_ID: (id: number) => `/Trend/${id}`,
        BY_CATEGORY: (categoryId: number) => `/Trend/category/${categoryId}`,
        LATEST: (categoryId: number) => `/Trend/category/${categoryId}/latest`,
        GENERATE: (categoryId: number) => `/Trend/category/${categoryId}/generate`,
        DETECT: (categoryId: number) => `/Trend/detect/${categoryId}`,
    },

    // Summaries
    SUMMARY: {
        BASE: '/Summary',
        BY_ID: (id: number) => `/Summary/${id}`,
        BY_USER: (userId: number) => `/Summary/user/${userId}`,
        DAILY: '/Summary/daily',
        BY_CATEGORY: (categoryId: number) => `/Summary/category/${categoryId}`,
        GENERATE: (categoryId: number) => `/Summary/category/${categoryId}/generate`,
    },

    // Dashboard
    DASHBOARD: {
        STATS: '/Dashboard/stats',
        ACTIVITY: '/Dashboard/activity',
        CATEGORIES: '/Dashboard/categories',
    },
} as const;

// API Configuration object
export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second

    // Headers
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },

    // Status codes
    STATUS_CODES: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
    },
} as const;

// Environment detection
export const ENVIRONMENT = {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    isTest: import.meta.env.MODE === 'test',
} as const;

// Feature flags
export const FEATURES = {
    ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA !== 'false',
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
} as const;

export default API_ENDPOINTS;
