// Server-side API client that uses NextAuth session token
import axios, { AxiosInstance, AxiosError } from "axios";
import type {
  DiagnosisResponse,
  DiagnosisHistoryResponse,
  BaseResponse,
  ApiError,
} from "@/types";

// Get API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Create an authenticated API client for server-side use
 * @param token - Auth token from NextAuth session
 */
export function createServerApiClient(token?: string): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  // Add response interceptor to handle BaseResponse wrapper
  client.interceptors.response.use(
    (response) => {
      // Handle BaseResponse wrapper
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
        return { ...response, data: baseResponse.data ?? response.data };
      }
      return response;
    },
    (error: AxiosError<BaseResponse | ApiError>) => {
      if (error.response) {
        const responseData = error.response.data;
        let apiError: ApiError;

        if (
          responseData &&
          typeof responseData === "object" &&
          "success" in responseData
        ) {
          const baseResponse = responseData as BaseResponse;
          apiError = {
            message: baseResponse.message || "An error occurred",
            errors: baseResponse.errors,
          };
        } else {
          apiError = {
            message: (responseData as ApiError)?.message || "An error occurred",
            errors: (responseData as ApiError)?.errors,
          };
        }
        return Promise.reject(apiError);
      }
      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Server-side diagnosis API functions
 */
export const diagnosisApiServer = {
  /**
   * Get diagnosis history (server-side)
   * @param token - Auth token
   * @param skip - Number of items to skip (0-indexed)
   * @param limit - Number of items per page
   */
  getHistory: async (token?: string, skip?: number, limit?: number): Promise<DiagnosisHistoryResponse> => {
    const client = createServerApiClient(token);
    const params = new URLSearchParams();
    if (skip !== undefined) params.append('skip', skip.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const url = `/api/v1/diagnosis/history${queryString ? `?${queryString}` : ''}`;
    
    const response = await client.get<DiagnosisHistoryResponse>(url);
    // Interceptor already unwraps BaseResponse, so data is already DiagnosisHistoryResponse
    return response.data;
  },

  /**
   * Get a single diagnosis by ID (server-side)
   */
  getById: async (
    id: string | number,
    token?: string
  ): Promise<DiagnosisResponse> => {
    const client = createServerApiClient(token);
    const response = await client.get<DiagnosisResponse>(
      `/api/v1/diagnosis/history/${id}`
    );
    // Interceptor already unwraps BaseResponse, so data is already DiagnosisResponse
    return response.data;
  },
};
