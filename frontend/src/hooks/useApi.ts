import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '@/types';
import { api } from '@/utils/api';

// Generic API hook options
interface UseApiOptions<T> {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    retry?: boolean;
    retryDelay?: number;
    retryAttempts?: number;
}

// Generic API hook return type
interface UseApiReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    execute: (...args: any[]) => Promise<T | null>;
    reset: () => void;
    refetch: () => Promise<T | null>;
}

// Generic API hook
export const useApi = <T>(
    apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
    options: UseApiOptions<T> = {}
): UseApiReturn<T> => {
    const {
        immediate = false,
        onSuccess,
        onError,
        retry = false,
        retryDelay = 1000,
        retryAttempts = 3,
    } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [args, setArgs] = useState<any[]>([]);

    const execute = useCallback(
        async (...executeArgs: any[]): Promise<T | null> => {
            setLoading(true);
            setError(null);
            setArgs(executeArgs);

            let attempts = 0;
            const maxAttempts = retry ? retryAttempts : 1;

            while (attempts < maxAttempts) {
                try {
                    const response = await apiFunction(...executeArgs);

                    if (response.success && response.data) {
                        setData(response.data);
                        onSuccess?.(response.data);
                        return response.data;
                    } else {
                        const errorMessage = response.message || 'Request failed';
                        setError(errorMessage);
                        onError?.(errorMessage);
                        return null;
                    }
                } catch (err: any) {
                    attempts++;

                    if (attempts >= maxAttempts) {
                        const errorMessage = err.response?.data?.message || err.message || 'Request failed';
                        setError(errorMessage);
                        onError?.(errorMessage);
                        return null;
                    }

                    // Wait before retry
                    if (retry && attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
                    }
                }
            }

            return null;
        },
        [apiFunction, onSuccess, onError, retry, retryDelay, retryAttempts]
    );

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
        setArgs([]);
    }, []);

    const refetch = useCallback(() => {
        return execute(...args);
    }, [execute, args]);

    // Execute immediately if requested
    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate, execute]);

    return {
        data,
        loading,
        error,
        execute,
        reset,
        refetch,
    };
};

// Specific hooks for common API patterns

// GET hook
export const useGet = <T>(
    url: string,
    options: UseApiOptions<T> = {}
): UseApiReturn<T> => {
    return useApi(
        (params?: any) => api.get<T>(url, params),
        { ...options, immediate: options.immediate !== false }
    );
};

// POST hook
export const usePost = <T>(
    url: string,
    options: UseApiOptions<T> = {}
): UseApiReturn<T> & { post: (data: any) => Promise<T | null> } => {
    const apiHook = useApi(
        (data: any) => api.post<T>(url, data),
        options
    );

    return {
        ...apiHook,
        post: apiHook.execute,
    };
};

// PUT hook
export const usePut = <T>(
    url: string,
    options: UseApiOptions<T> = {}
): UseApiReturn<T> & { put: (data: any) => Promise<T | null> } => {
    const apiHook = useApi(
        (data: any) => api.put<T>(url, data),
        options
    );

    return {
        ...apiHook,
        put: apiHook.execute,
    };
};

// DELETE hook
export const useDelete = <T>(
    url: string,
    options: UseApiOptions<T> = {}
): UseApiReturn<T> & { delete: () => Promise<T | null> } => {
    const apiHook = useApi(
        () => api.delete<T>(url),
        options
    );

    return {
        ...apiHook,
        delete: apiHook.execute,
    };
};

// Pagination hook
interface UsePaginationOptions {
    initialPage?: number;
    initialPageSize?: number;
    totalItems?: number;
}

interface UsePaginationReturn {
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: () => void;
    previousPage: () => void;
    goToPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setTotalItems: (total: number) => void;
}

export const usePagination = (
    options: UsePaginationOptions = {}
): UsePaginationReturn => {
    const { initialPage = 1, initialPageSize = 10, totalItems = 0 } = options;

    const [page, setPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [total, setTotal] = useState(totalItems);

    const totalPages = Math.ceil(total / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const nextPage = () => {
        if (hasNextPage) {
            setPage(page + 1);
        }
    };

    const previousPage = () => {
        if (hasPreviousPage) {
            setPage(page - 1);
        }
    };

    const goToPage = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const changePageSize = (newSize: number) => {
        setPageSize(newSize);
        setPage(1); // Reset to first page when changing page size
    };

    const setTotalItems = (newTotal: number) => {
        setTotal(newTotal);
        // Adjust current page if it's now beyond the total pages
        if (page > Math.ceil(newTotal / pageSize)) {
            setPage(1);
        }
    };

    return {
        page,
        pageSize,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        nextPage,
        previousPage,
        goToPage,
        setPageSize: changePageSize,
        setTotalItems,
    };
};

// Search hook
interface UseSearchOptions {
    debounceMs?: number;
    minQueryLength?: number;
}

export const useSearch = (
    searchFunction: (query: string) => Promise<any[]>,
    options: UseSearchOptions = {}
) => {
    const { debounceMs = 300, minQueryLength = 2 } = options;

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= minQueryLength) {
                setLoading(true);
                setError(null);

                try {
                    const searchResults = await searchFunction(query);
                    setResults(searchResults);
                } catch (err: any) {
                    setError(err.message || 'Search failed');
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setError(null);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [query, searchFunction, debounceMs, minQueryLength]);

    return {
        query,
        setQuery,
        results,
        loading,
        error,
        clearResults: () => setResults([]),
    };
};

// Local storage hook
export const useLocalStorage = <T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
};

// Debounce hook
export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};
