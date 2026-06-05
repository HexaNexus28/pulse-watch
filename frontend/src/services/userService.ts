import { API_CONFIG, API_ENDPOINTS } from '../config/api';

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  isActive: boolean;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiration: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

class UserService {
  private baseUrl = API_CONFIG.BASE_URL;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        ...API_CONFIG.HEADERS,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`,
          statusCode: response.status,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        statusCode: 500,
      };
    }
  }

  async getAll(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>(API_ENDPOINTS.USER.BASE);
  }

  async getById(id: number): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USER.BY_ID(id));
  }

  async create(user: CreateUserDto): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async update(id: number, user: UpdateUserDto): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USER.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.USER.DELETE(id), {
      method: 'DELETE',
    });
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: CreateUserDto): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USER.BASE);
  }

  async checkEmailExists(email: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(API_ENDPOINTS.USER.CHECK_EMAIL(email));
  }

  async checkUsernameExists(username: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(API_ENDPOINTS.USER.CHECK_USERNAME(username));
  }
}

export const userService = new UserService();
export default userService;
