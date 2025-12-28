// Reusable error message component with responsive design
'use client';

import { formatApiError, type FormattedError } from '@/lib/error-utils';

/**
 * Gets error icon based on error type
 */
function getErrorIcon(type: "error" | "warning" | "info") {
  switch (type) {
    case "warning":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "info":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
}

interface ErrorMessageProps {
  error: any;
  className?: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ error, className = '', onDismiss }: ErrorMessageProps) {
  if (!error) return null;

  const formattedError: FormattedError = formatApiError(error);
  const Icon = getErrorIcon(formattedError.type);

  const bgColors = {
    error: 'bg-red-50 border-red-500 text-red-700',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-700',
    info: 'bg-blue-50 border-blue-500 text-blue-700',
  };

  const iconColors = {
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  return (
    <div
      className={`${bgColors[formattedError.type]} border-l-4 rounded-lg p-4 sm:p-5 animate-slide-down shadow-sm ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`flex-shrink-0 ${iconColors[formattedError.type]} mt-0.5`}>
          {Icon}
        </div>
        <div className="flex-1 min-w-0">
          {formattedError.title && (
            <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">
              {formattedError.title}
            </h3>
          )}
          <p className="text-sm sm:text-base leading-relaxed break-words">
            {formattedError.message}
          </p>
          {formattedError.details && formattedError.details.length > 0 && (
            <ul className="mt-3 sm:mt-4 list-disc list-inside text-sm sm:text-base space-y-1.5 sm:space-y-2 pl-2">
              {formattedError.details.map((detail, index) => (
                <li key={index} className="break-words">{detail}</li>
              ))}
            </ul>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${iconColors[formattedError.type]} hover:opacity-75 transition-opacity p-1 -mt-1 -mr-1`}
            aria-label="Dismiss error"
            type="button"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

