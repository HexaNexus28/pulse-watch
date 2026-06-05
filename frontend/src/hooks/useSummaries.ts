import { useState, useEffect, useCallback } from 'react';
import { summaryService } from '../services/summaryService';
import { Summary } from '../types';

interface UseSummariesReturn {
    data: Summary[] | null;
    loading: boolean;
    error: string | null;
    execute: () => Promise<void>;
    reset: () => void;
}

interface UseSummaryReturn {
    data: Summary | null;
    loading: boolean;
    error: string | null;
    execute: () => Promise<void>;
    reset: () => void;
}

interface UseGenerateSummaryReturn {
    generateSummary: (categoryId: number) => Promise<Summary | null>;
    loading: boolean;
    error: string | null;
}

interface UseDeleteSummaryReturn {
    deleteSummary: (id: number) => Promise<boolean>;
    loading: boolean;
    error: string | null;
}

// Hook pour récupérer tous les summaries
export const useSummaries = (): UseSummariesReturn => {
    const [data, setData] = useState<Summary[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Call the real API to get summaries from database
            const response = await summaryService.getAll();

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch summaries');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { data, loading, error, execute, reset };
};

// Hook pour récupérer un summary par ID
export const useSummary = (id: number): UseSummaryReturn => {
    const [data, setData] = useState<Summary | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const response = await summaryService.getById(id);

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch summary');
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

// Hook pour récupérer les summaries par utilisateur
export const useSummariesByUser = (userId: number): UseSummariesReturn => {
    const [data, setData] = useState<Summary[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await summaryService.getByUser(userId);

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch summaries by user');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    useEffect(() => {
        if (userId) {
            execute();
        }
    }, [execute, userId]);

    return { data, loading, error, execute, reset };
};

// Hook pour récupérer les summaries quotidiens
export const useDailySummaries = (immediate = true): UseSummariesReturn => {
    const [data, setData] = useState<Summary[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await summaryService.getDaily();

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch daily summaries');
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

// Hook pour récupérer les summaries par catégorie
export const useSummariesByCategory = (categoryId: number): UseSummariesReturn => {
    const [data, setData] = useState<Summary[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        if (!categoryId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await summaryService.getByCategory(categoryId);

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch summaries by category');
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

// Hook pour générer un summary
export const useGenerateSummary = (): UseGenerateSummaryReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const generateSummary = useCallback(async (id: number): Promise<Summary | null> => {
        setLoading(true);
        setError(null);

        try {
            // Call the real API to generate summary from trend
            const response = await summaryService.generateForCategory(id);

            if (response.success && response.data) {
                return response.data;
            } else {
                setError(response.message || 'Failed to generate summary');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { generateSummary, loading, error };
};

// Hook pour supprimer un summary
export const useDeleteSummary = (): UseDeleteSummaryReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const deleteSummary = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await summaryService.delete(id);

            if (response.success) {
                return true;
            } else {
                setError(response.message || 'Failed to delete summary');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { deleteSummary, loading, error };
};
