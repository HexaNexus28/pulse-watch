import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { ApiResponse } from '@/types';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh token
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
                        refreshToken,
                    });

                    const { token } = response.data;
                    localStorage.setItem('auth_token', token);

                    // Retry original request
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user with clear message
                console.warn('Session expired - refresh token failed:', refreshError);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');

                // Show user-friendly message and redirect
                const event = new CustomEvent('session-expired', {
                    detail: { message: 'Your session has expired. Please login again.' }
                });
                window.dispatchEvent(event);

                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Generic API wrapper functions
export const api = {
    // GET request
    get: async <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.get<ApiResponse<T>>(url, { params });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // POST request
    post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.post<ApiResponse<T>>(url, data);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // PUT request
    put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.put<ApiResponse<T>>(url, data);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // PATCH request
    patch: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.patch<ApiResponse<T>>(url, data);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // DELETE request
    delete: async <T>(url: string): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.delete<ApiResponse<T>>(url);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
};

// Error handler
function handleApiError(error: any): ApiResponse<never> {
    console.error('API Error Details:', error);

    if (axios.isAxiosError(error)) {
        const response = error.response?.data as ApiResponse<never>;
        console.error('API Response:', response);
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);

        return {
            success: false,
            message: response?.message || error.message || 'An error occurred',
            data: undefined,
            errors: response?.errors || [error.message || 'Unknown error'],
            validationErrors: response?.validationErrors || {},
            statusCode: error.response?.status || 500,
            timestamp: new Date().toISOString(),
            traceId: response?.traceId || ''
        };
    }

    return {
        success: false,
        message: error?.message || 'An unexpected error occurred',
        data: undefined,
        errors: [error?.message || 'Unknown error'],
        validationErrors: {},
        statusCode: 500,
        timestamp: new Date().toISOString(),
        traceId: ''
    };
}

// Utility functions for common API patterns
export const apiUtils = {
    // Handle file uploads
    uploadFile: async (url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post<ApiResponse<any>>(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(progress);
                    }
                },
            });

            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // Download file
    downloadFile: async (url: string, filename?: string): Promise<void> => {
        try {
            const response = await apiClient.get(url, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
            throw error;
        }
    },

    // Retry mechanism
    retryRequest: async <T>(
        requestFn: () => Promise<ApiResponse<T>>,
        attempts: number = API_CONFIG.RETRY_ATTEMPTS,
        delay: number = API_CONFIG.RETRY_DELAY
    ): Promise<ApiResponse<T>> => {
        let lastError: any;

        for (let i = 0; i < attempts; i++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;
                if (i < attempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                }
            }
        }

        throw lastError;
    },
};

export default api;
