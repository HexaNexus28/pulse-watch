import { useState, useEffect, useCallback } from 'react';
import { feedService } from '../services/feedService';
import { CreateFeedDto, UpdateFeedDto, Feed } from '../types';

interface UseFeedsReturn {
    data: Feed[] | null;
    loading: boolean;
    error: string | null;
    execute: () => Promise<void>;
    reset: () => void;
}

interface UseFeedReturn {
    data: Feed | null;
    loading: boolean;
    error: string | null;
    execute: () => Promise<void>;
    reset: () => void;
}

interface UseCreateFeedReturn {
    createFeed: (feed: CreateFeedDto) => Promise<Feed | null>;
    loading: boolean;
    error: string | null;
}

interface UseUpdateFeedReturn {
    updateFeed: (id: number, feed: UpdateFeedDto) => Promise<Feed | null>;
    loading: boolean;
    error: string | null;
}

interface UseDeleteFeedReturn {
    deleteFeed: (id: number) => Promise<boolean>;
    loading: boolean;
    error: string | null;
}

// Hook pour récupérer tous les feeds
export const useFeeds = (immediate = true): UseFeedsReturn => {
    const [data, setData] = useState<Feed[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await feedService.getAll();

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch feeds');
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

// Hook pour récupérer un feed par ID
export const useFeed = (id: number): UseFeedReturn => {
    const [data, setData] = useState<Feed | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const response = await feedService.getById(id);

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch feed');
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

// Hook pour récupérer les feeds par catégorie
export const useFeedsByCategory = (categoryId: number): UseFeedsReturn => {
    const [data, setData] = useState<Feed[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        if (!categoryId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await feedService.getByCategory(categoryId);

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch feeds by category');
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

// Hook pour créer un feed
export const useCreateFeed = (): UseCreateFeedReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createFeed = useCallback(async (feed: CreateFeedDto): Promise<Feed | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await feedService.create(feed);

            if (response.success && response.data) {
                return response.data;
            } else {
                setError(response.message || 'Failed to create feed');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { createFeed, loading, error };
};

// Hook pour mettre à jour un feed
export const useUpdateFeed = (): UseUpdateFeedReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateFeed = useCallback(async (id: number, feed: UpdateFeedDto): Promise<Feed | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await feedService.update(id, feed);

            if (response.success && response.data) {
                return response.data;
            } else {
                setError(response.message || 'Failed to update feed');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { updateFeed, loading, error };
};

// Hook pour supprimer un feed
export const useDeleteFeed = (): UseDeleteFeedReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const deleteFeed = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await feedService.delete(id);

            if (response.success) {
                return true;
            } else {
                setError(response.message || 'Failed to delete feed');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { deleteFeed, loading, error };
};
