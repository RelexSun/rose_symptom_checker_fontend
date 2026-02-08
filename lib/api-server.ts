// Server-side API client that uses NextAuth session token
import axios, { AxiosInstance, AxiosError } from "axios";
import type {
  DiagnosisResponse,
  DiagnosisHistoryResponse,
  Outcome,
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

  // Add request interceptor for logging
  client.interceptors.request.use(
    (config) => {
      (config as any).metadata = { startTime: Date.now() };

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

        console.log("[API Server Request]", JSON.stringify(logData, null, 2));
      } catch (err) {
        // Fallback to basic logging if JSON stringify fails
        console.log("[API Server Request]", {
          method: config.method,
          url: `${config.baseURL || ""}${config.url || ""}`,
          error: "Failed to log request details",
        });
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor to handle BaseResponse wrapper
  client.interceptors.response.use(
    (response) => {
      // Log successful responses
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

        console.log("[API Server Response]", JSON.stringify(logData, null, 2));
      } catch {
        // Ignore logging errors
      }

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

        console.error("[API Server Error]", JSON.stringify(logData, null, 2));
      } catch {
        // Ignore logging errors
      }

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
  getHistory: async (
    token?: string,
    skip?: number,
    limit?: number
  ): Promise<DiagnosisHistoryResponse> => {
    const client = createServerApiClient(token);
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

    const response = await client.get<
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
   * Get a single diagnosis by ID (server-side)
   */
  getById: async (
    id: string | number,
    token?: string
  ): Promise<DiagnosisResponse> => {
    const client = createServerApiClient(token);
    const response = await client.get<BaseResponse<DiagnosisResponse>>(
      `/api/v1/diagnosis/history/${id}`
    );
    // Interceptor already unwraps BaseResponse, so data is already DiagnosisResponse
    return response.data as unknown as DiagnosisResponse;
  },
};

/**
 * Server-side outcome API functions
 */
export const outcomeApiServer = {
  /**
   * Get a single outcome by ID (server-side)
   */
  getById: async (id: string | number, token?: string): Promise<Outcome> => {
    const client = createServerApiClient(token);
    const response = await client.get<BaseResponse<Outcome>>(
      `/api/v1/outcomes/${id}`
    );
    // Interceptor already unwraps BaseResponse, so data is already Outcome
    return response.data as unknown as Outcome;
  },
};
