import { useState, useEffect, useCallback } from 'react';
import { userService, User, CreateUserDto, UpdateUserDto, LoginCredentials, AuthResponse } from '../services/userService';

interface UseUsersReturn {
    data: User[] | null;
    loading: boolean;
    error: string | null;
    execute: () => Promise<void>;
    reset: () => void;
}

interface UseUserReturn {
    data: User | null;
    loading: boolean;
    error: string | null;
    execute: () => Promise<void>;
    reset: () => void;
}

interface UseCreateUserReturn {
    createUser: (user: CreateUserDto) => Promise<User | null>;
    loading: boolean;
    error: string | null;
}

interface UseUpdateUserReturn {
    updateUser: (id: number, user: UpdateUserDto) => Promise<User | null>;
    loading: boolean;
    error: string | null;
}

interface UseDeleteUserReturn {
    deleteUser: (id: number) => Promise<boolean>;
    loading: boolean;
    error: string | null;
}

interface UseAuthReturn {
    login: (credentials: LoginCredentials) => Promise<AuthResponse | null>;
    register: (userData: CreateUserDto) => Promise<User | null>;
    logout: () => void;
    loading: boolean;
    error: string | null;
}

// Hook pour récupérer tous les utilisateurs
export const useUsers = (immediate = true): UseUsersReturn => {
    const [data, setData] = useState<User[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.getAll();
            
            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch users');
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

// Hook pour récupérer un utilisateur par ID
export const useUser = (id: number): UseUserReturn => {
    const [data, setData] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        if (!id) return;
        
        setLoading(true);
        setError(null);

        try {
            const response = await userService.getById(id);
            
            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch user');
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

// Hook pour créer un utilisateur
export const useCreateUser = (): UseCreateUserReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createUser = useCallback(async (user: CreateUserDto): Promise<User | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.create(user);
            
            if (response.success && response.data) {
                return response.data;
            } else {
                setError(response.message || 'Failed to create user');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { createUser, loading, error };
};

// Hook pour mettre à jour un utilisateur
export const useUpdateUser = (): UseUpdateUserReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateUser = useCallback(async (id: number, user: UpdateUserDto): Promise<User | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.update(id, user);
            
            if (response.success && response.data) {
                return response.data;
            } else {
                setError(response.message || 'Failed to update user');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { updateUser, loading, error };
};

// Hook pour supprimer un utilisateur
export const useDeleteUser = (): UseDeleteUserReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const deleteUser = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.delete(id);
            
            if (response.success) {
                return true;
            } else {
                setError(response.message || 'Failed to delete user');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { deleteUser, loading, error };
};

// Hook pour l'authentification
export const useAuth = (): UseAuthReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.login(credentials);
            
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

    const register = useCallback(async (userData: CreateUserDto): Promise<User | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.register(userData);
            
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
