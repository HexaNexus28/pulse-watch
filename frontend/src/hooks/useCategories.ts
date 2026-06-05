import { useState, useEffect, useCallback } from 'react';
import { categoryService, Category } from '../services/categoryService';
import { CreateCategoryDto, UpdateCategoryDto } from '../types';

interface UseCategoriesReturn {
    data: Category[] | null;
    loading: boolean;
    error: string | null;
    execute: () => Promise<void>;
    reset: () => void;
}

interface UseCategoryReturn {
    data: Category | null;
    loading: boolean;
    error: string | null;
    execute: () => Promise<void>;
    reset: () => void;
}

interface UseCreateCategoryReturn {
    createCategory: (category: CreateCategoryDto) => Promise<Category | null>;
    loading: boolean;
    error: string | null;
}

interface UseUpdateCategoryReturn {
    updateCategory: (id: number, category: UpdateCategoryDto) => Promise<Category | null>;
    loading: boolean;
    error: string | null;
}

interface UseDeleteCategoryReturn {
    deleteCategory: (id: number) => Promise<boolean>;
    loading: boolean;
    error: string | null;
}

// Hook pour récupérer toutes les catégories
export const useCategories = (immediate = true): UseCategoriesReturn => {
    const [data, setData] = useState<Category[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await categoryService.getAll();

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch categories');
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

// Hook pour récupérer une catégorie par ID
export const useCategory = (id: number): UseCategoryReturn => {
    const [data, setData] = useState<Category | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const response = await categoryService.getById(id);

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch category');
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

// Hook pour créer une catégorie
export const useCreateCategory = (): UseCreateCategoryReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createCategory = useCallback(async (category: CreateCategoryDto): Promise<Category | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await categoryService.create(category);

            if (response.success && response.data) {
                return response.data;
            } else {
                setError(response.message || 'Failed to create category');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { createCategory, loading, error };
};

// Hook pour mettre à jour une catégorie
export const useUpdateCategory = (): UseUpdateCategoryReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateCategory = useCallback(async (id: number, category: UpdateCategoryDto): Promise<Category | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await categoryService.update(id, category);

            if (response.success && response.data) {
                return response.data;
            } else {
                setError(response.message || 'Failed to update category');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { updateCategory, loading, error };
};

// Hook pour supprimer une catégorie
export const useDeleteCategory = (): UseDeleteCategoryReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const deleteCategory = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await categoryService.delete(id);

            if (response.success) {
                return true;
            } else {
                setError(response.message || 'Failed to delete category');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { deleteCategory, loading, error };
};
