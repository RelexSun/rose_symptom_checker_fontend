// Centralized API client using Axios
import axios, { AxiosInstance, AxiosError } from "axios";
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
  UpdateUserPayload,
  Symptom,
  SymptomPayload,
  Outcome,
  OutcomePayload,
  Rule,
  RulePayload,
} from "@/types";

// Get API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Log API URL in development to help with debugging
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("API Base URL:", API_BASE_URL);
}

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Attach timing metadata for logging
    (config as any).metadata = { startTime: Date.now() };

    // Comprehensive request log
    try {
      const fullUrl = `${config.baseURL || ""}${config.url || ""}`;
      const logData: any = {
        timestamp: new Date().toISOString(),
        method: config.method?.toUpperCase(),
        url: fullUrl,
      };

      // Add query parameters if present
      if (config.params) {
        logData.params = config.params;
      }

      // Add request headers (excluding sensitive ones)
      if (config.headers) {
        const safeHeaders: any = {};
        Object.keys(config.headers).forEach((key) => {
          if (key.toLowerCase() !== "authorization") {
            safeHeaders[key] = config.headers[key];
          } else {
            safeHeaders[key] = config.headers[key] ? "[REDACTED]" : undefined;
          }
        });
        logData.headers = safeHeaders;
      }

      // Log request body (data) when present
      if (config.data) {
        logData.body = config.data;
      }

      console.log("[API Request]", JSON.stringify(logData, null, 2));
    } catch (err) {
      // Fallback to basic logging if JSON stringify fails
      console.log("[API Request]", {
        method: config.method,
        url: `${config.baseURL || ""}${config.url || ""}`,
        error: "Failed to log request details",
      });
    }

    // Get token from localStorage (client-side) or from cookies (server-side)
    if (typeof window !== "undefined") {
      // Try to get token from localStorage first (for signup flow)
      let token = localStorage.getItem("auth_token");

      // If no token in localStorage, try to get from NextAuth session
      if (!token) {
        try {
          const { getSession } = await import("next-auth/react");
          const session = await getSession();
          if (session && (session as any).token) {
            token = (session as any).token;
            // Also store in localStorage for consistency
            if (token) {
              localStorage.setItem("auth_token", token);
            }
          }
        } catch (e) {
          // Session not available, continue with localStorage token
        }
      }

      if (token) {
        // Token might be stored as access_token or full token object
        try {
          const accessToken = token.startsWith("{")
            ? JSON.parse(token).access_token
            : token;
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
    // Compute duration and log response
    try {
      const metadata = (response.config as any).metadata;
      const durationMs =
        metadata && metadata.startTime
          ? Date.now() - metadata.startTime
          : undefined;

      const fullUrl = `${response.config.baseURL || ""}${
        response.config.url || ""
      }`;
      const logData: any = {
        timestamp: new Date().toISOString(),
        method: response.config.method?.toUpperCase(),
        url: fullUrl,
        status: response.status,
        statusText: response.statusText,
      };

      if (durationMs !== undefined) {
        logData.durationMs = durationMs;
      }

      // Log response headers (excluding sensitive ones)
      if (response.headers) {
        const safeHeaders: any = {};
        Object.keys(response.headers).forEach((key) => {
          if (key.toLowerCase() !== "authorization") {
            safeHeaders[key] = response.headers[key];
          }
        });
        logData.headers = safeHeaders;
      }

      // Log raw response body
      logData.body = response.data;

      console.log("[API Response]", JSON.stringify(logData, null, 2));
    } catch {
      // Ignore logging errors
    }

    // Handle BaseResponse wrapper - check if response has success field
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data
    ) {
      const baseResponse = response.data as BaseResponse;
      if (!baseResponse.success) {
        const apiError: ApiError = {
          message: baseResponse.message || "An error occurred",
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
    // Log error responses
    try {
      const config = error.config;
      const metadata = (config as any)?.metadata;
      const durationMs =
        metadata && metadata.startTime
          ? Date.now() - metadata.startTime
          : undefined;

      const fullUrl = config
        ? `${config.baseURL || ""}${config.url || ""}`
        : undefined;
      const logData: any = {
        timestamp: new Date().toISOString(),
        method: config?.method?.toUpperCase(),
        url: fullUrl,
        status: error.response?.status,
        statusText: error.response?.statusText,
      };

      if (durationMs !== undefined) {
        logData.durationMs = durationMs;
      }

      logData.errorMessage = error.message;

      // Log error response body when available
      if (error.response?.data) {
        logData.responseBody = error.response.data;
      }

      // Log request body for context
      if (config?.data) {
        logData.requestBody = config.data;
      }

      // Log request headers (excluding sensitive ones)
      if (config?.headers) {
        const safeHeaders: any = {};
        Object.keys(config.headers).forEach((key) => {
          if (key.toLowerCase() !== "authorization") {
            safeHeaders[key] = config.headers[key];
          } else {
            safeHeaders[key] = config.headers[key] ? "[REDACTED]" : undefined;
          }
        });
        logData.requestHeaders = safeHeaders;
      }

      // Log response headers if available
      if (error.response?.headers) {
        const safeHeaders: any = {};
        const responseHeaders = error.response.headers;
        Object.keys(responseHeaders).forEach((key) => {
          if (key.toLowerCase() !== "authorization") {
            safeHeaders[key] = responseHeaders[key];
          }
        });
        logData.responseHeaders = safeHeaders;
      }

      console.error("[API Error]", JSON.stringify(logData, null, 2));
    } catch {
      // Ignore logging errors
    }

    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data;
      const status = error.response.status;
      let apiError: ApiError;

      // Check if it's a BaseResponse
      if (
        responseData &&
        typeof responseData === "object" &&
        "success" in responseData
      ) {
        const baseResponse = responseData as BaseResponse;
        apiError = {
          message: baseResponse.message || getDefaultErrorMessage(status),
          errors: baseResponse.errors,
        };
      } else {
        apiError = {
          message:
            (responseData as ApiError)?.message ||
            getDefaultErrorMessage(status),
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
      let errorMessage = "Unable to connect to the server. ";
      if (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) {
        errorMessage +=
          "Please ensure your backend server is running and accessible.";
      } else {
        errorMessage +=
          "This could be due to a network issue, CORS configuration, or the server being temporarily unavailable. Please check your internet connection and try again.";
      }

      // Log error details in development
      if (process.env.NODE_ENV === "development") {
        console.error("API Request Error:", {
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
        message:
          error.message || "An unexpected error occurred. Please try again.",
      } as ApiError);
    }
  }
);

// Helper function to get default error messages based on HTTP status
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "The request was invalid. Please check your input and try again.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "This resource already exists. Please use a different value.";
    case 422:
      return "The information you provided is invalid. Please check and try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
      return "Our servers are experiencing issues. Please try again in a few moments.";
    case 503:
      return "The service is temporarily unavailable. Please try again later.";
    default:
      return "An error occurred. Please try again.";
  }
}

// Auth API functions
export const authApi = {
  /**
   * Register a new user
   * Returns: { user: User, token: Token }
   */
  register: async (
    credentials: RegisterCredentials
  ): Promise<{ user: User; token: Token }> => {
    const response = await apiClient.post<
      BaseResponse<{ user: User; token: Token }>
    >("/api/v1/auth/register", credentials);
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
      "/api/v1/auth/login",
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
      "/api/v1/diagnosis/symptoms"
    );
    // Interceptor unwraps BaseResponse, so data is already string[]
    return response.data as unknown as string[];
  },

  /**
   * Submit symptoms for diagnosis
   */
  check: async (request: SymptomInput): Promise<DiagnosisResult> => {
    const response = await apiClient.post<BaseResponse<DiagnosisResult>>(
      "/api/v1/diagnosis/check",
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
  getHistory: async (
    skip?: number,
    limit?: number
  ): Promise<DiagnosisHistoryResponse> => {
    const params = new URLSearchParams();

    // Validate and add skip parameter (minimum: 0)
    if (skip !== undefined && skip >= 0) {
      params.append("skip", skip.toString());
    }

    // Validate and add limit parameter (minimum: 1, maximum: 1000)
    if (limit !== undefined && limit >= 1 && limit <= 1000) {
      params.append("limit", limit.toString());
    }

    const queryString = params.toString();
    const url = `/api/v1/diagnosis/history${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiClient.get<
      BaseResponse<DiagnosisResponse[] | DiagnosisHistoryResponse>
    >(url);

    // Handle case where data is an array directly or wrapped in DiagnosisHistoryResponse
    const data = response.data as unknown as
      | DiagnosisResponse[]
      | DiagnosisHistoryResponse;

    // If data is an array, wrap it in DiagnosisHistoryResponse structure
    if (Array.isArray(data)) {
      const calculatedPage =
        skip !== undefined && limit !== undefined && limit > 0
          ? Math.floor(skip / limit) + 1
          : 1;
      return {
        total: data.length,
        items: data,
        page: calculatedPage,
        limit: limit ?? 10,
        total_pages: limit && limit > 0 ? Math.ceil(data.length / limit) : 1,
      };
    }

    // Otherwise, return as DiagnosisHistoryResponse
    return data as DiagnosisHistoryResponse;
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

// Symptom management API (admin)
export const symptomApi = {
  /**
   * List symptoms with optional filters
   */
  list: async (params?: {
    skip?: number;
    limit?: number;
    category?: string | null;
    is_active?: boolean | null;
  }): Promise<Symptom[]> => {
    const searchParams = new URLSearchParams();

    if (params?.skip !== undefined) {
      searchParams.append("skip", params.skip.toString());
    }
    if (params?.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }
    if (params?.category !== undefined && params.category !== null) {
      searchParams.append("category", params.category);
    }
    if (params?.is_active !== undefined && params.is_active !== null) {
      searchParams.append("is_active", params.is_active ? "true" : "false");
    }

    const queryString = searchParams.toString();
    const url = `/api/v1/symptoms${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<BaseResponse<Symptom[]>>(url);
    return response.data as unknown as Symptom[];
  },

  /**
   * Get a single symptom by ID
   */
  getById: async (id: number | string): Promise<Symptom> => {
    const response = await apiClient.get<BaseResponse<Symptom>>(
      `/api/v1/symptoms/${id}`
    );
    return response.data as unknown as Symptom;
  },

  /**
   * Create a new symptom (admin only)
   */
  create: async (payload: SymptomPayload): Promise<Symptom> => {
    const response = await apiClient.post<BaseResponse<Symptom>>(
      "/api/v1/symptoms",
      payload
    );
    return response.data as unknown as Symptom;
  },

  /**
   * Update an existing symptom (admin only)
   */
  update: async (
    id: number | string,
    payload: SymptomPayload
  ): Promise<Symptom> => {
    const response = await apiClient.put<BaseResponse<Symptom>>(
      `/api/v1/symptoms/${id}`,
      payload
    );
    return response.data as unknown as Symptom;
  },

  /**
   * Delete a symptom (admin only)
   */
  delete: async (id: number | string): Promise<void> => {
    await apiClient.delete<BaseResponse<unknown>>(`/api/v1/symptoms/${id}`);
  },
};

// Outcome (disease) management API (admin)
export const outcomeApi = {
  /**
   * List outcomes with optional filters
   */
  list: async (params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean | null;
  }): Promise<Outcome[]> => {
    const searchParams = new URLSearchParams();

    if (params?.skip !== undefined) {
      searchParams.append("skip", params.skip.toString());
    }
    if (params?.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }
    if (params?.is_active !== undefined && params.is_active !== null) {
      searchParams.append("is_active", params.is_active ? "true" : "false");
    }

    const queryString = searchParams.toString();
    const url = `/api/v1/outcomes${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<BaseResponse<Outcome[]>>(url);
    return response.data as unknown as Outcome[];
  },

  /**
   * Get a single outcome by ID
   */
  getById: async (id: number | string): Promise<Outcome> => {
    const response = await apiClient.get<BaseResponse<Outcome>>(
      `/api/v1/outcomes/${id}`
    );
    return response.data as unknown as Outcome;
  },

  /**
   * Create a new outcome (admin only)
   */
  create: async (payload: OutcomePayload): Promise<Outcome> => {
    const response = await apiClient.post<BaseResponse<Outcome>>(
      "/api/v1/outcomes",
      payload
    );
    return response.data as unknown as Outcome;
  },

  /**
   * Update an existing outcome (admin only)
   */
  update: async (
    id: number | string,
    payload: OutcomePayload
  ): Promise<Outcome> => {
    const response = await apiClient.put<BaseResponse<Outcome>>(
      `/api/v1/outcomes/${id}`,
      payload
    );
    return response.data as unknown as Outcome;
  },

  /**
   * Delete an outcome (admin only)
   */
  delete: async (id: number | string): Promise<void> => {
    await apiClient.delete<BaseResponse<unknown>>(`/api/v1/outcomes/${id}`);
  },
};

// Rule management API (admin)
export const ruleApi = {
  /**
   * List rules with optional filters
   */
  list: async (params?: {
    skip?: number;
    limit?: number;
    outcome_id?: number | null;
    is_active?: boolean | null;
  }): Promise<Rule[]> => {
    const searchParams = new URLSearchParams();

    if (params?.skip !== undefined) {
      searchParams.append("skip", params.skip.toString());
    }
    if (params?.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }
    if (params?.outcome_id !== undefined && params.outcome_id !== null) {
      searchParams.append("outcome_id", params.outcome_id.toString());
    }
    if (params?.is_active !== undefined && params.is_active !== null) {
      searchParams.append("is_active", params.is_active ? "true" : "false");
    }

    const queryString = searchParams.toString();
    const url = `/api/v1/rules${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<BaseResponse<Rule[]>>(url);
    return response.data as unknown as Rule[];
  },

  /**
   * Get a single rule by ID
   */
  getById: async (id: number | string): Promise<Rule> => {
    const response = await apiClient.get<BaseResponse<Rule>>(
      `/api/v1/rules/${id}`
    );
    return response.data as unknown as Rule;
  },

  /**
   * Create a new rule (admin only)
   */
  create: async (payload: RulePayload): Promise<Rule> => {
    const response = await apiClient.post<BaseResponse<Rule>>(
      "/api/v1/rules",
      payload
    );
    return response.data as unknown as Rule;
  },

  /**
   * Update a rule (admin only)
   */
  update: async (
    id: number | string,
    payload: RulePayload
  ): Promise<Rule> => {
    const response = await apiClient.put<BaseResponse<Rule>>(
      `/api/v1/rules/${id}`,
      payload
    );
    return response.data as unknown as Rule;
  },

  /**
   * Delete a rule (admin only)
   */
  delete: async (id: number | string): Promise<void> => {
    await apiClient.delete<BaseResponse<unknown>>(`/api/v1/rules/${id}`);
  },
};

// User management API functions (primarily for admin dashboard)
export const userApi = {
  /**
   * Get current authenticated user profile
   */
  me: async (): Promise<User> => {
    const response = await apiClient.get<BaseResponse<User>>(
      "/api/v1/users/me"
    );
    return response.data as unknown as User;
  },

  /**
   * List users with optional filters (admin only)
   */
  list: async (params?: {
    skip?: number;
    limit?: number;
    role_id?: number | null;
    is_active?: boolean | null;
  }): Promise<User[]> => {
    const searchParams = new URLSearchParams();

    if (params?.skip !== undefined) {
      searchParams.append("skip", params.skip.toString());
    }
    if (params?.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }
    if (params?.role_id !== undefined && params.role_id !== null) {
      searchParams.append("role_id", params.role_id.toString());
    }
    if (params?.is_active !== undefined && params.is_active !== null) {
      searchParams.append("is_active", params.is_active ? "true" : "false");
    }

    const queryString = searchParams.toString();
    const url = `/api/v1/users${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<BaseResponse<User[]>>(url);
    return response.data as unknown as User[];
  },

  /**
   * Get a single user by ID (admin only)
   */
  getById: async (id: number | string): Promise<User> => {
    const response = await apiClient.get<BaseResponse<User>>(
      `/api/v1/users/${id}`
    );
    return response.data as unknown as User;
  },

  /**
   * Update a user (admin only)
   */
  update: async (
    id: number | string,
    payload: UpdateUserPayload
  ): Promise<User> => {
    const response = await apiClient.put<BaseResponse<User>>(
      `/api/v1/users/${id}`,
      payload
    );
    return response.data as unknown as User;
  },

  /**
   * Delete a user (admin only)
   */
  delete: async (id: number | string): Promise<void> => {
    await apiClient.delete<BaseResponse<unknown>>(`/api/v1/users/${id}`);
  },
};

// Helper function to set auth token
export const setAuthToken = (token: string | null) => {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }
};

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

export default apiClient;
