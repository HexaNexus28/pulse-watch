import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginDto, CreateUserDto } from '@/types';
import { api } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Auth action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Auth context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: CreateUserDto) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (user: User) => void;
  refreshToken: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await api.get<User>(API_ENDPOINTS.USER.BASE);
          if (response.success && response.data) {
            dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
          } else {
            // Invalid token, clear it
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            dispatch({ type: 'AUTH_FAILURE', payload: 'Your session has expired. Please login again.' });
          }
        } catch (error) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          dispatch({ type: 'AUTH_FAILURE', payload: 'Your session has expired. Please login again.' });
        }
      } else {
        dispatch({ type: 'AUTH_SUCCESS', payload: null as any });
      }
    };

    initAuth();
  }, []);

  // Listen for session expired events
  useEffect(() => {
    const handleSessionExpired = (event: CustomEvent) => {
      dispatch({ type: 'AUTH_FAILURE', payload: event.detail.message });
    };

    window.addEventListener('session-expired', handleSessionExpired as EventListener);
    
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired as EventListener);
    };
  }, []);

  // Login function
  const login = async (credentials: LoginDto): Promise<void> => {
    console.log('🔐 Login attempt with:', credentials);
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      console.log('📡 API Response:', response);
      
      // Maintenant l'API retourne bien ApiResponse<AuthResponse>
      if (response.success && response.data) {
        const { token, refreshToken, user } = response.data;
        console.log('✅ Login successful - User:', user);
        
        // Store tokens
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        
        // Redirect to dashboard after successful login
        console.log('🔄 Redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else {
        console.log('❌ Login failed - Response:', response);
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Login failed' });
      }
    } catch (error: any) {
      console.log('💥 Login error:', error);
      const message = error.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
    }
  };

  // Register function
  const register = async (userData: CreateUserDto): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      if (response.success && response.data) {
        const { token, refreshToken, user } = response.data;
        
        // Store tokens
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        
        // Redirect to dashboard after successful registration
        window.location.href = '/dashboard';
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Registration failed' });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Call logout endpoint if available
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Ignore logout errors
    } finally {
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Update user function
  const updateUser = (user: User): void => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    const refresh_token = localStorage.getItem('refresh_token');
    
    if (!refresh_token) {
      await logout();
      return;
    }

    try {
      const response = await api.post<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token,
      });
      
      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
      } else {
        await logout();
      }
    } catch (error) {
      await logout();
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Protected route component
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = <div>Loading...</div> 
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return fallback;
  }

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
};

export default AuthContext;
