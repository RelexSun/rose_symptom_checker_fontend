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

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
          }
        } catch (e) {
          // Session not available, continue with localStorage token
        }
      }
      
      if (token) {
        // Token might be stored as access_token or full token object
        const accessToken = token.startsWith('{') ? JSON.parse(token).access_token : token;
        config.headers.Authorization = `Bearer ${accessToken}`;
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
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
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
    const data = response.data as { user: User; token: Token };
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
    const token = response.data as Token;
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
    return response.data as string[];
  },

  /**
   * Submit symptoms for diagnosis
   */
  check: async (request: SymptomInput): Promise<DiagnosisResult> => {
    const response = await apiClient.post<BaseResponse<DiagnosisResult>>(
      '/api/v1/diagnosis/check',
      request
    );
    return response.data as DiagnosisResult;
  },

  /**
   * Get diagnosis history
   */
  getHistory: async (): Promise<DiagnosisHistoryResponse> => {
    const response = await apiClient.get<BaseResponse<DiagnosisHistoryResponse>>(
      '/api/v1/diagnosis/history'
    );
    return response.data as DiagnosisHistoryResponse;
  },

  /**
   * Get a single diagnosis by ID
   */
  getById: async (id: string | number): Promise<DiagnosisResponse> => {
    const response = await apiClient.get<BaseResponse<DiagnosisResponse>>(
      `/api/v1/diagnosis/history/${id}`
    );
    return response.data as DiagnosisResponse;
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

