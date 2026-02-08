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
  // Optional fields mainly used in admin/user management views
  full_name?: string;
  role_id?: number;
  role_name?: string;
  last_login?: string;
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

// Admin user management
export interface UpdateUserPayload {
  email: string;
  username: string;
  full_name: string;
  role_id: number;
  is_active: boolean;
}

// Diagnosis types
export interface SymptomInput {
  symptom_ids: number[];
}

// Symptom management (admin)
export type SymptomSeverity = "mild" | "moderate" | "severe";

export interface Symptom {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  severity: SymptomSeverity;
  is_active: boolean;
  display_order: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface SymptomPayload {
  code: string;
  name: string;
  description: string;
  category: string;
  severity: SymptomSeverity;
  is_active: boolean;
  display_order: number;
}

// Outcome (disease) management (admin)
export type OutcomeSeverity = string;

export interface Outcome {
  id: number;
  code: string;
  name: string;
  scientific_name: string;
  description: string;
  severity: OutcomeSeverity;
  treatment: string;
  prevention: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface OutcomePayload {
  code: string;
  name: string;
  scientific_name: string;
  description: string;
  severity: OutcomeSeverity;
  treatment: string;
  prevention: string;
  is_active: boolean;
}

export interface DiagnosisOutcome {
  outcome_id: number;
  outcome_name: string;
  outcome_code: string;
  confidence_score: number;
  treatment: string;
  prevention: string;
  matched_rules: Array<{ rule_id: number }>;
}

// Diagnosis check now returns an array of outcomes
export type DiagnosisResult = DiagnosisOutcome[];

export interface DiagnosisResponse {
  id: number;
  user_id: number;
  symptoms_reported: number[];
  outcome_id: number;
  outcome_name: string;
  confidence_score: number;
  notes: string;
  created_at: string;
}

export interface DiagnosisHistoryResponse {
  total: number;
  items: DiagnosisResponse[];
  page?: number;
  limit?: number;
  total_pages?: number;
}

// Rule management (admin)
export type RuleLogic = "AND" | "OR";

export interface RuleCondition {
  symptom_id: number;
  operator: "present" | "absent" | "equals" | "greater_than" | "less_than";
}

export interface RuleConditions {
  logic: RuleLogic;
  conditions: RuleCondition[];
}

export interface Rule {
  id: number;
  rule_name: string;
  description: string;
  outcome_id: number;
  conditions: RuleConditions;
  confidence_score: number;
  priority: number;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  outcome_name?: string;
  outcome_code?: string;
}

export interface RulePayload {
  rule_name: string;
  description: string;
  outcome_id: number;
  conditions: RuleConditions;
  confidence_score: number;
  priority: number;
  is_active: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
