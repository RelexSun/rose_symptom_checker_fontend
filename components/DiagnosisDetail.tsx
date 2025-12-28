// Diagnosis detail component to display a single diagnosis
'use client';

import Link from 'next/link';
import type { DiagnosisResponse } from '@/types';

interface DiagnosisDetailProps {
  diagnosis: DiagnosisResponse;
}

export function DiagnosisDetail({ diagnosis }: DiagnosisDetailProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <Link
          href="/diagnosis/history"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          ← Back to History
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Diagnosis Details
      </h1>

      <div className="space-y-6">
        {/* Disease Predicted */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Disease Predicted</h2>
          <p className="text-lg text-gray-700 bg-blue-50 p-4 rounded-lg">
            {diagnosis.disease_predicted || 'No diagnosis available'}
          </p>
        </div>

        {/* Confidence */}
        {diagnosis.confidence_score !== undefined && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Confidence Level
            </h2>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: `${diagnosis.confidence_score * 100}%` }}
                ></div>
              </div>
              <span className="text-gray-700 font-medium">
                {(diagnosis.confidence_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Symptoms */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Symptoms Analyzed</h2>
          <div className="space-y-2">
            {diagnosis.symptoms.length > 0 ? (
              diagnosis.symptoms.map((symptom, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg"
                >
                  <span className="text-gray-700">
                    {symptom.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No symptoms recorded</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {diagnosis.recommendations && diagnosis.recommendations.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Recommendations</h2>
            <ul className="space-y-2">
              {diagnosis.recommendations.map((recommendation, index) => (
                <li
                  key={index}
                  className="bg-green-50 p-3 rounded-lg text-gray-700 flex items-start"
                >
                  <span className="text-green-600 mr-2">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Date */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Diagnosis Date
          </h3>
          <p className="text-gray-800">
            {new Date(diagnosis.created_at).toLocaleString()}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200">
          <Link
            href="/diagnosis/check"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Check New Symptoms
          </Link>
        </div>
      </div>
    </div>
  );
}

