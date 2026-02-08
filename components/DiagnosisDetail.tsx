// Diagnosis detail component to display a single diagnosis
'use client';

import Link from 'next/link';
import type { DiagnosisResponse, Outcome } from '@/types';

interface DiagnosisDetailProps {
  diagnosis?: DiagnosisResponse | null;
  outcome?: Outcome | null;
}

export function DiagnosisDetail({ diagnosis, outcome }: DiagnosisDetailProps) {
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
        {outcome ? 'Outcome Details' : 'Diagnosis Details'}
      </h1>

      <div className="space-y-6">
        {/* Outcome */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Outcome</h2>
          {outcome ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p className="text-lg font-semibold text-gray-900">
                  {outcome.name}
                </p>
                {outcome.scientific_name && (
                  <p className="text-sm text-gray-600 italic">
                    {outcome.scientific_name}
                  </p>
                )}
                {outcome.code && (
                  <p className="text-xs text-gray-500 font-mono">
                    Code: {outcome.code}
                  </p>
                )}
              </div>
              {outcome.description && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {outcome.description}
                  </p>
                </div>
              )}
              {outcome.severity && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Severity</h3>
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium capitalize">
                    {outcome.severity}
                  </span>
                </div>
              )}
            </>
          ) : (
          <p className="text-lg text-gray-700 bg-blue-50 p-4 rounded-lg">
              {diagnosis?.outcome_name || 'No outcome available'}
          </p>
          )}
        </div>

        {/* Confidence */}
        {diagnosis?.confidence_score !== undefined && (
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

        {/* Symptoms Reported */}
        {diagnosis?.symptoms_reported && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Symptoms Reported</h2>
          <div className="space-y-2">
            {diagnosis.symptoms_reported.length > 0 ? (
              diagnosis.symptoms_reported.map((symptomId, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg"
                >
                  <span className="text-gray-700">
                    Symptom ID: {symptomId}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No symptoms recorded</p>
            )}
          </div>
        </div>
        )}

        {/* Treatment */}
        {outcome?.treatment && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Treatment</h2>
            <div className="bg-green-50 p-4 rounded-lg text-gray-700">
              <p className="whitespace-pre-line">{outcome.treatment}</p>
            </div>
          </div>
        )}

        {/* Prevention */}
        {outcome?.prevention && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Prevention</h2>
            <div className="bg-amber-50 p-4 rounded-lg text-gray-700">
              <p className="whitespace-pre-line">{outcome.prevention}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {diagnosis?.notes && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Notes</h2>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
              <p className="whitespace-pre-line">{diagnosis.notes}</p>
            </div>
          </div>
        )}

        {/* Date */}
        {diagnosis?.created_at && (
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Diagnosis Date
          </h3>
          <p className="text-gray-800">
            {new Date(diagnosis.created_at).toLocaleString()}
          </p>
        </div>
        )}

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

