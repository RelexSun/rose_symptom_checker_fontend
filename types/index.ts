// Type definitions for the application - aligned with backend schemas

// Base response wrapper from backend
export interface BaseResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

// Token response
export interface Token {
  access_token: string;
  token_type: string;
}

// User types
export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

// Auth response wrapped in BaseResponse
export interface AuthResponse {
  user: User;
  token: Token;
}

// Diagnosis types
export interface SymptomInput {
  symptoms: string[];
}

export interface DiagnosisResult {
  disease: string;
  confidence: number;
  symptoms_analyzed: string[];
  recommendations: string[];
}

export interface DiagnosisResponse {
  id: number;
  user_id: number;
  symptoms: string[];
  disease_predicted: string;
  confidence_score: number;
  recommendations: string[];
  created_at: string;
}

export interface DiagnosisHistoryResponse {
  total: number;
  items: DiagnosisResponse[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
