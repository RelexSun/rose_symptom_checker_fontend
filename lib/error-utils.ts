// Utility functions for handling and formatting user-friendly error messages
import type { ApiError } from "@/types";

export interface FormattedError {
  title: string;
  message: string;
  type: "error" | "warning" | "info";
  details?: string[];
}

/**
 * Formats API errors into user-friendly messages
 */
export function formatApiError(error: any): FormattedError {
  // Handle ApiError type
  if (error && typeof error === "object") {
    const apiError = error as ApiError;

    // Check if there are field-specific errors
    if (apiError.errors && typeof apiError.errors === "object") {
      const fieldErrors = apiError.errors as Record<string, string[]>;
      const errorFields = Object.keys(fieldErrors);

      if (errorFields.length > 0) {
        const details: string[] = [];
        errorFields.forEach((field) => {
          const messages = fieldErrors[field];
          if (Array.isArray(messages)) {
            messages.forEach((msg) => {
              details.push(`${formatFieldName(field)}: ${msg}`);
            });
          }
        });

        return {
          title: "Validation Error",
          message: "Please check the following fields:",
          type: "error",
          details,
        };
      }
    }

    // Handle specific error messages
    const message = apiError.message || "An error occurred";

    // Map common error messages to user-friendly ones
    const friendlyMessage = mapErrorMessage(message);

    return {
      title: "Error",
      message: friendlyMessage,
      type: "error",
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      title: "Error",
      message: mapErrorMessage(error),
      type: "error",
    };
  }

  // Default error
  return {
    title: "Error",
    message: "Something went wrong. Please try again.",
    type: "error",
  };
}

/**
 * Maps technical error messages to user-friendly ones
 */
function mapErrorMessage(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Authentication errors
  if (lowerMessage.includes("invalid") && lowerMessage.includes("password")) {
    return "The email or password you entered is incorrect. Please try again.";
  }

  if (
    lowerMessage.includes("invalid") &&
    lowerMessage.includes("credentials")
  ) {
    return "The email or password you entered is incorrect. Please check your credentials and try again.";
  }

  if (lowerMessage.includes("unauthorized") || lowerMessage.includes("401")) {
    return "Your session has expired. Please sign in again.";
  }

  if (lowerMessage.includes("forbidden") || lowerMessage.includes("403")) {
    return "You do not have permission to perform this action.";
  }

  // Registration errors
  if (
    (lowerMessage.includes("email") && lowerMessage.includes("already")) ||
    lowerMessage.includes("exists")
  ) {
    return "An account with this email address already exists. Please sign in or use a different email.";
  }

  if (
    (lowerMessage.includes("username") && lowerMessage.includes("already")) ||
    lowerMessage.includes("taken")
  ) {
    return "This username is already taken. Please choose a different username.";
  }

  if (lowerMessage.includes("email") && lowerMessage.includes("invalid")) {
    return "Please enter a valid email address.";
  }

  if (
    (lowerMessage.includes("password") && lowerMessage.includes("weak")) ||
    lowerMessage.includes("short")
  ) {
    return "Password is too weak. Please use at least 8 characters with a mix of letters and numbers.";
  }

  if (lowerMessage.includes("username") && lowerMessage.includes("length")) {
    return "Username must be between 3 and 50 characters long.";
  }

  // Network errors
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("connection") ||
    lowerMessage.includes("fetch")
  ) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  if (lowerMessage.includes("timeout")) {
    return "The request took too long. Please check your connection and try again.";
  }

  // Server errors
  if (
    lowerMessage.includes("500") ||
    lowerMessage.includes("internal server")
  ) {
    return "Our servers are experiencing issues. Please try again in a few moments.";
  }

  if (
    lowerMessage.includes("503") ||
    lowerMessage.includes("service unavailable")
  ) {
    return "The service is temporarily unavailable. Please try again later.";
  }

  if (lowerMessage.includes("404") || lowerMessage.includes("not found")) {
    return "The requested resource was not found.";
  }

  // Validation errors
  if (lowerMessage.includes("required") || lowerMessage.includes("missing")) {
    return "Please fill in all required fields.";
  }

  if (lowerMessage.includes("invalid") && lowerMessage.includes("format")) {
    return "The format of the information you entered is incorrect. Please check and try again.";
  }

  // Diagnosis errors
  if (lowerMessage.includes("symptom")) {
    return "Please select at least one symptom to get a diagnosis.";
  }

  if (lowerMessage.includes("diagnosis") && lowerMessage.includes("failed")) {
    return "Unable to process your symptoms. Please try again or contact support if the problem persists.";
  }

  // Return original message if no mapping found (it might already be user-friendly)
  return message;
}

/**
 * Formats field names for display
 */
function formatFieldName(field: string): string {
  const fieldMap: Record<string, string> = {
    email: "Email",
    password: "Password",
    username: "Username",
    symptoms: "Symptoms",
  };

  return (
    fieldMap[field] ||
    field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ")
  );
}
