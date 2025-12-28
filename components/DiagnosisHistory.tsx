// Diagnosis history component to display list of past diagnoses
'use client';

import Link from 'next/link';
import type { DiagnosisResponse } from '@/types';

interface DiagnosisHistoryProps {
  diagnoses: DiagnosisResponse[];
}

export function DiagnosisHistory({ diagnoses }: DiagnosisHistoryProps) {
  if (diagnoses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600 mb-4">No diagnosis history found.</p>
        <Link
          href="/diagnosis/check"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Check your symptoms now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {diagnoses.map((diagnosis) => (
        <Link
          key={diagnosis.id}
          href={`/diagnosis/history/${diagnosis.id}`}
          className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {diagnosis.disease_predicted || 'Diagnosis Result'}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Symptoms:</span>{' '}
                  {diagnosis.symptoms
                    .map((s) => s.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' '))
                    .join(', ') || 'N/A'}
                </p>
                {diagnosis.confidence_score !== undefined && (
                  <p>
                    <span className="font-medium">Confidence:</span>{' '}
                    {(diagnosis.confidence_score * 100).toFixed(1)}%
                  </p>
                )}
                <p>
                  <span className="font-medium">Date:</span>{' '}
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

