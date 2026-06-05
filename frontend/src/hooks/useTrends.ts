import { useState, useEffect, useCallback } from 'react';
import { trendService, Trend } from '../services/trendService';

interface UseTrendsReturn {
    data: Trend[] | null;
    loading: boolean;
    error: string | null;
    execute: () => Promise<void>;
    reset: () => void;
}

interface UseTrendReturn {
    data: Trend | null;
    loading: boolean;
    error: string | null;
    execute: () => Promise<void>;
    reset: () => void;
}

interface UseGenerateTrendReturn {
    generateTrend: (categoryId: number) => Promise<Trend | null>;
    loading: boolean;
    error: string | null;
}

interface UseDetectTrendsReturn {
    detectTrends: (categoryId: number) => Promise<Trend[] | null>;
    loading: boolean;
    error: string | null;
}

// Hook pour récupérer tous les trends
export const useTrends = (immediate = true): UseTrendsReturn => {
    const [data, setData] = useState<Trend[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await trendService.getAll();

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch trends');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { data, loading, error, execute, reset };
};

// Hook pour récupérer un trend par ID
export const useTrend = (id: number): UseTrendReturn => {
    const [data, setData] = useState<Trend | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const response = await trendService.getById(id);

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch trend');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    useEffect(() => {
        if (id) {
            execute();
        }
    }, [execute, id]);

    return { data, loading, error, execute, reset };
};

// Hook pour récupérer les trends par catégorie
export const useTrendsByCategory = (categoryId: number): UseTrendsReturn => {
    const [data, setData] = useState<Trend[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        if (!categoryId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await trendService.getByCategory(categoryId);

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch trends by category');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [categoryId]);

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    useEffect(() => {
        if (categoryId) {
            execute();
        }
    }, [execute, categoryId]);

    return { data, loading, error, execute, reset };
};

// Hook pour récupérer le trend le plus récent par catégorie
export const useLatestTrend = (categoryId: number): UseTrendReturn => {
    const [data, setData] = useState<Trend | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        if (!categoryId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await trendService.getLatestByCategory(categoryId);

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch latest trend');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [categoryId]);

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    useEffect(() => {
        if (categoryId) {
            execute();
        }
    }, [execute, categoryId]);

    return { data, loading, error, execute, reset };
};

// Hook pour générer un trend
export const useGenerateTrend = (): UseGenerateTrendReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const generateTrend = useCallback(async (categoryId: number): Promise<Trend | null> => {
        setLoading(true);
        setError(null);

        try {
            // Use detectTrends to get dynamic keywords from RSS feeds
            const response = await trendService.detectTrends(categoryId);

            if (response.success && response.data && response.data.length > 0) {
                // Return the first detected trend (could return all if needed)
                return response.data[0];
            } else {
                setError(response.message || 'No trends detected from RSS feeds');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { generateTrend, loading, error };
};

// Hook pour détecter les trends
export const useDetectTrends = (): UseDetectTrendsReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const detectTrends = useCallback(async (categoryId: number): Promise<Trend[] | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await trendService.detectTrends(categoryId);

            if (response.success && response.data) {
                return response.data;
            } else {
                setError(response.message || 'Failed to detect trends');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { detectTrends, loading, error };
};
