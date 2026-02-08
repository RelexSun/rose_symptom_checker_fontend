// Diagnosis history component to display list of past diagnoses
"use client";

import Link from "next/link";
import type { DiagnosisResponse } from "@/types";

interface DiagnosisHistoryProps {
  diagnoses?: DiagnosisResponse[];
}

export function DiagnosisHistory({ diagnoses }: DiagnosisHistoryProps) {
  if (!diagnoses || diagnoses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-gray-700 text-lg font-medium mb-2">
          You don&apos;t have any diagnosis history yet
        </p>
        <p className="text-gray-500 mb-6">
          Start by checking your symptoms to get your first diagnosis
        </p>
        <Link
          href="/diagnosis/check"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          Check Your Symptoms Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {diagnoses.map((diagnosis) => (
        <Link
          key={diagnosis.id}
          href={`/diagnosis/history/${diagnosis.outcome_id}`}
          className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {diagnosis.outcome_name || "Diagnosis Result"}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Symptoms Reported:</span>{" "}
                  {diagnosis.symptoms_reported &&
                  diagnosis.symptoms_reported.length > 0
                    ? `${diagnosis.symptoms_reported.length} symptom${
                        diagnosis.symptoms_reported.length > 1 ? "s" : ""
                      }`
                    : "N/A"}
                </p>
                {diagnosis.confidence_score !== undefined && (
                  <p>
                    <span className="font-medium">Confidence:</span>{" "}
                    {(diagnosis.confidence_score * 100).toFixed(1)}%
                  </p>
                )}
                {diagnosis.notes && (
                  <p>
                    <span className="font-medium">Notes:</span>{" "}
                    {diagnosis.notes}
                  </p>
                )}
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(diagnosis.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="ml-4">
              <span className="text-blue-600 hover:text-blue-700 font-medium">
                View Details →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
