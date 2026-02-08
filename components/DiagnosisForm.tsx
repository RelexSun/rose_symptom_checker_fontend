// Diagnosis form component for submitting symptoms
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { diagnosisApi, symptomApi } from "@/lib/api";
import { ErrorMessage } from "@/components/ErrorMessage";
import { revalidateDiagnosisHistory } from "@/app/actions/revalidate";
import type { SymptomInput, DiagnosisResult, Symptom } from "@/types";

export function DiagnosisForm() {
  const router = useRouter();
  const [availableSymptoms, setAvailableSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSymptoms, setLoadingSymptoms] = useState(true);
  const [error, setError] = useState<any>(null);

  // Fetch available symptoms on mount
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        setLoadingSymptoms(true);
        // Fetch all active symptoms for selection (no pagination in UI)
        const symptoms = await symptomApi.list({
          skip: 0,
          limit: 1000,
          is_active: true,
        });
        setAvailableSymptoms(symptoms);
      } catch (err: any) {
        setError(
          err || {
            message:
              "Unable to load available symptoms. Please refresh the page and try again.",
          }
        );
      } finally {
        setLoadingSymptoms(false);
      }
    };

    fetchSymptoms();
  }, []);

  // We use symptom.id as the value we send to the backend
  const toggleSymptom = (id: number) => {
    setSelectedSymptomIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedSymptomIds.length === 0) {
      setError({
        message: "Please select at least one symptom to get a diagnosis.",
      });
      return;
    }

    setLoading(true);

    const request: SymptomInput = {
      symptom_ids: selectedSymptomIds,
    };

    try {
      const result: DiagnosisResult = await diagnosisApi.check(request);
      // Store result in sessionStorage to pass to result page
      sessionStorage.setItem("diagnosis_result", JSON.stringify(result));
      // Revalidate diagnosis history page to show new diagnosis
      await revalidateDiagnosisHistory();
      // Route to result page
      router.push("/diagnosis/result");
    } catch (err: any) {
      // Log error for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('Diagnosis check error:', err);
      }
      
      // Use error message from API if available, otherwise use default
      const errorMessage = err?.message || 
        "Unable to process your symptoms. Please check your connection and try again.";
      
      setError({
        message: errorMessage,
      });
      setLoading(false);
    }
  };

  // Format symptom name for display (replace underscores with spaces and capitalize)
  const formatSymptomName = (value: string): string => {
    return value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ErrorMessage error={error} onDismiss={() => setError(null)} />

        {/* Symptoms Section */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Select Symptoms
            {selectedSymptomIds.length > 0 && (
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {selectedSymptomIds.length} selected
              </span>
            )}
          </label>

          {loadingSymptoms ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500 text-lg">
                Loading available symptoms...
              </p>
            </div>
          ) : (
            <div className="border-2 border-gray-200 rounded-xl p-6 max-h-96 overflow-y-auto bg-gray-50 hover:border-blue-300 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableSymptoms.map((symptom, index) => (
                  <label
                    key={symptom.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer border-2 transition-all hover-lift ${
                      selectedSymptomIds.includes(symptom.id)
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-400 shadow-md"
                        : "bg-white border-gray-200 hover:border-blue-300"
                    }`}
                    style={{
                      animationDelay: `${index * 0.02}s`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSymptomIds.includes(symptom.id)}
                      onChange={() => toggleSymptom(symptom.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer transition-all"
                    />
                    <span
                      className={`text-sm flex-1 font-medium ${
                        selectedSymptomIds.includes(symptom.id)
                          ? "text-blue-900"
                          : "text-gray-700"
                      }`}
                    >
                      {symptom.name
                        ? symptom.name
                        : formatSymptomName(symptom.code)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {selectedSymptomIds.length > 0 && (
            <div className="mt-6 animate-slide-up">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Selected Symptoms:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSymptomIds.map((id, index) => {
                  const symptom = availableSymptoms.find((s) => s.id === id);
                  const code = symptom?.code ?? "";

                  return (
                  <span
                      key={id}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105 animate-bounce-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                      {symptom?.name
                        ? symptom.name
                        : formatSymptomName(code)}
                    <button
                      type="button"
                        onClick={() => toggleSymptom(id)}
                      className="ml-2 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      aria-label="Remove symptom"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || loadingSymptoms || selectedSymptomIds.length === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              <span>Analyzing symptoms...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Check Symptoms</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
