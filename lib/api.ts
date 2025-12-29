// Centralized API client using Axios
import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
  Token,
  SymptomInput,
  DiagnosisResult,
  DiagnosisResponse,
  DiagnosisHistoryResponse,
  BaseResponse,
  ApiError,
} from '@/types';

// Get API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Log API URL in development to help with debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL);
}

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Get token from localStorage (client-side) or from cookies (server-side)
    if (typeof window !== 'undefined') {
      // Try to get token from localStorage first (for signup flow)
      let token = localStorage.getItem('auth_token');
      
      // If no token in localStorage, try to get from NextAuth session
      if (!token) {
        try {
          const { getSession } = await import('next-auth/react');
          const session = await getSession();
          if (session && (session as any).token) {
            token = (session as any).token;
            // Also store in localStorage for consistency
            if (token) {
              localStorage.setItem('auth_token', token);
            }
          }
        } catch (e) {
          // Session not available, continue with localStorage token
        }
      }
      
      if (token) {
        // Token might be stored as access_token or full token object
        try {
          const accessToken = token.startsWith('{') ? JSON.parse(token).access_token : token;
          config.headers.Authorization = `Bearer ${accessToken}`;
        } catch (e) {
          // If parsing fails, use token as-is
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Handle BaseResponse wrapper - check if response has success field
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const baseResponse = response.data as BaseResponse;
      if (!baseResponse.success) {
        const apiError: ApiError = {
          message: baseResponse.message || 'An error occurred',
          errors: baseResponse.errors,
        };
        return Promise.reject(apiError);
      }
      // Return the data field if it exists, otherwise return the whole response
      return { ...response, data: baseResponse.data ?? response.data };
    }
    return response;
  },
  (error: AxiosError<BaseResponse | ApiError>) => {
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data;
      const status = error.response.status;
      let apiError: ApiError;
      
      // Check if it's a BaseResponse
      if (responseData && typeof responseData === 'object' && 'success' in responseData) {
        const baseResponse = responseData as BaseResponse;
        apiError = {
          message: baseResponse.message || getDefaultErrorMessage(status),
          errors: baseResponse.errors,
        };
      } else {
        apiError = {
          message: (responseData as ApiError)?.message || getDefaultErrorMessage(status),
          errors: (responseData as ApiError)?.errors,
        };
      }
      return Promise.reject(apiError);
    } else if (error.request) {
      // Request was made but no response received
      // This could be CORS, network timeout, or server not reachable
      const apiUrl = API_BASE_URL;
      const isNetworkError = !error.request.response;
      
      // Provide more helpful error message
      let errorMessage = 'Unable to connect to the server. ';
      if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
        errorMessage += 'Please ensure your backend server is running and accessible.';
      } else {
        errorMessage += 'This could be due to a network issue, CORS configuration, or the server being temporarily unavailable. Please check your internet connection and try again.';
      }
      
      // Log error details in development
      if (process.env.NODE_ENV === 'development') {
        console.error('API Request Error:', {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
          hasAuth: !!error.config?.headers?.Authorization,
          error: error.message,
        });
      }
      
      return Promise.reject({
        message: errorMessage,
      } as ApiError);
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred. Please try again.',
      } as ApiError);
    }
  }
);

// Helper function to get default error messages based on HTTP status
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'The request was invalid. Please check your input and try again.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This resource already exists. Please use a different value.';
    case 422:
      return 'The information you provided is invalid. Please check and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Our servers are experiencing issues. Please try again in a few moments.';
    case 503:
      return 'The service is temporarily unavailable. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}

// Auth API functions
export const authApi = {
  /**
   * Register a new user
   * Returns: { user: User, token: Token }
   */
  register: async (credentials: RegisterCredentials): Promise<{ user: User; token: Token }> => {
    const response = await apiClient.post<BaseResponse<{ user: User; token: Token }>>(
      '/api/v1/auth/register',
      credentials
    );
    // Interceptor unwraps BaseResponse, so data is already { user: User; token: Token }
    const data = response.data as unknown as { user: User; token: Token };
    // Store the access token
    if (data.token?.access_token) {
      setAuthToken(data.token.access_token);
    }
    return data;
  },

  /**
   * Login user
   * Returns: { access_token: string, token_type: string }
   */
  login: async (credentials: LoginCredentials): Promise<Token> => {
    const response = await apiClient.post<BaseResponse<Token>>(
      '/api/v1/auth/login',
      credentials
    );
    // Interceptor unwraps BaseResponse, so data is already Token
    const token = response.data as unknown as Token;
    // Store the access token
    if (token?.access_token) {
      setAuthToken(token.access_token);
    }
    return token;
  },
};

// Diagnosis API functions
export const diagnosisApi = {
  /**
   * Get available symptoms
   */
  getSymptoms: async (): Promise<string[]> => {
    const response = await apiClient.get<BaseResponse<string[]>>(
      '/api/v1/diagnosis/symptoms'
    );
    // Interceptor unwraps BaseResponse, so data is already string[]
    return response.data as unknown as string[];
  },

  /**
   * Submit symptoms for diagnosis
   */
  check: async (request: SymptomInput): Promise<DiagnosisResult> => {
    const response = await apiClient.post<BaseResponse<DiagnosisResult>>(
      '/api/v1/diagnosis/check',
      request
    );
    // Interceptor unwraps BaseResponse, so data is already DiagnosisResult
    return response.data as unknown as DiagnosisResult;
  },

  /**
   * Get diagnosis history
   * @param skip - Number of items to skip (0-indexed)
   * @param limit - Number of items per page
   */
  getHistory: async (skip?: number, limit?: number): Promise<DiagnosisHistoryResponse> => {
    const params = new URLSearchParams();
    if (skip !== undefined) params.append('skip', skip.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const url = `/api/v1/diagnosis/history${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<BaseResponse<DiagnosisHistoryResponse>>(url);
    // Interceptor unwraps BaseResponse, so data is already DiagnosisHistoryResponse
    return response.data as unknown as DiagnosisHistoryResponse;
  },

  /**
   * Get a single diagnosis by ID
   */
  getById: async (id: string | number): Promise<DiagnosisResponse> => {
    const response = await apiClient.get<BaseResponse<DiagnosisResponse>>(
      `/api/v1/diagnosis/history/${id}`
    );
    // Interceptor unwraps BaseResponse, so data is already DiagnosisResponse
    return response.data as unknown as DiagnosisResponse;
  },
};

// Helper function to set auth token
export const setAuthToken = (token: string | null) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
};

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export default apiClient;

