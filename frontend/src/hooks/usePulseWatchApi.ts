import { useState, useEffect, useCallback } from 'react';
import apiService, { 
  ApiResponse, 
  User, 
  Category, 
  Feed, 
  Note, 
  Trend, 
  Summary, 
  DashboardStats 
} from '../services/apiService';

// Hook générique pour les appels API
interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: () => Promise<void>;
  reset: () => void;
}

export const useApi = <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  immediate = false
): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || 'Request failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

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

// Hooks spécifiques pour chaque entité

// Dashboard
export const useDashboardStats = () => {
  return useApi<DashboardStats>(() => apiService.getDashboardStats(), true);
};

// Categories
export const useCategories = () => {
  return useApi<Category[]>(() => apiService.getAllCategories(), true);
};

export const useCategory = (id: number) => {
  return useApi<Category>(() => apiService.getCategoryById(id), !!id);
};

export const useCreateCategory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = useCallback(async (category: { name: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.createCategory(category);
      
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

// Feeds
export const useFeeds = () => {
  return useApi<Feed[]>(() => apiService.getAllFeeds(), true);
};

export const useFeedsByCategory = (categoryId: number) => {
  return useApi<Feed[]>(() => apiService.getFeedsByCategory(categoryId), !!categoryId);
};

export const useCreateFeed = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFeed = useCallback(async (feed: { url: string; name: string; categoryId: number }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.createFeed(feed);
      
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

// Notes
export const useNotes = () => {
  return useApi<Note[]>(() => apiService.getAllNotes(), true);
};

export const useNotesByCategory = (categoryId: number) => {
  return useApi<Note[]>(() => apiService.getNotesByCategory(categoryId), !!categoryId);
};

export const useCreateNote = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNote = useCallback(async (note: { title: string; content: string; categoryId: number }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.createNote(note);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Failed to create note');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createNote, loading, error };
};

// Trends
export const useTrends = () => {
  return useApi<Trend[]>(() => apiService.getAllTrends(), true);
};

export const useTrendsByCategory = (categoryId: number) => {
  return useApi<Trend[]>(() => apiService.getTrendsByCategory(categoryId), !!categoryId);
};

export const useLatestTrend = (categoryId: number) => {
  return useApi<Trend>(() => apiService.getLatestTrendByCategory(categoryId), !!categoryId);
};

export const useGenerateTrend = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTrend = useCallback(async (categoryId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.generateTrendForCategory(categoryId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Failed to generate trend');
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

// Summaries
export const useSummaries = () => {
  return useApi<Summary[]>(() => apiService.getAllSummaries(), true);
};

export const useSummariesByCategory = (categoryId: number) => {
  return useApi<Summary[]>(() => apiService.getSummariesByCategory(categoryId), !!categoryId);
};

export const useDailySummaries = () => {
  return useApi<Summary[]>(() => apiService.getDailySummaries(), true);
};

export const useGenerateSummary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = useCallback(async (categoryId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.generateSummaryForCategory(categoryId);
      
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

// Users
export const useUsers = () => {
  return useApi<User[]>(() => apiService.getAllUsers(), true);
};

export const useUser = (id: number) => {
  return useApi<User>(() => apiService.getUserById(id), !!id);
};

// Auth
export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.login(credentials);
      
      if (response.success && response.data) {
        // Stocker le token dans localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        return response.data;
      } else {
        setError(response.message || 'Login failed');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: { username: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.register(userData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Registration failed');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }, []);

  return { login, register, logout, loading, error };
};

// Hook pour vérifier si l'utilisateur est authentifié
export const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  return { isAuthenticated, loading };
};
