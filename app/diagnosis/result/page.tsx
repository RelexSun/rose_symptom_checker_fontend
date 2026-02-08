// Diagnosis result page - displays immediate diagnosis result
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { DiagnosisResult, DiagnosisOutcome } from '@/types';

function DiagnosisResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get result from sessionStorage (passed from form)
    const storedResult = sessionStorage.getItem('diagnosis_result');
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        setResult(parsed);
        // Clear the stored result after reading
        sessionStorage.removeItem('diagnosis_result');
      } catch (e) {
        console.error('Failed to parse diagnosis result', e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!result || !Array.isArray(result) || result.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Result Found</h1>
            <p className="text-gray-600 mb-6">Please check your symptoms again.</p>
            <Link
              href="/diagnosis/check"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            >
              Check Symptoms Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sort by confidence score (highest first)
  const sortedOutcomes = [...result].sort((a, b) => b.confidence_score - a.confidence_score);
  const primaryOutcome = sortedOutcomes[0];
  const otherOutcomes = sortedOutcomes.slice(1);

  // Helper function to get confidence color
  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'from-green-500 to-emerald-600';
    if (score >= 0.6) return 'from-blue-500 to-indigo-600';
    if (score >= 0.4) return 'from-yellow-500 to-orange-600';
    return 'from-gray-400 to-gray-500';
  };

  // Helper function to get confidence badge color
  const getConfidenceBadgeColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 0.6) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const primaryConfidencePercent = (primaryOutcome.confidence_score * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/diagnosis/check"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors group"
          >
            <svg
              className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Symptom Checker
          </Link>
        </div>

        {/* Summary Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Diagnosis Results
                </h1>
              <p className="text-gray-600 text-lg">
                Found <span className="font-bold text-blue-600">{sortedOutcomes.length}</span> possible {sortedOutcomes.length === 1 ? 'outcome' : 'outcomes'} based on your symptoms
              </p>
              </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg
                  className="w-6 h-6 text-white"
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
                </div>
              </div>
            </div>
          </div>

        {/* Primary Outcome - Most Prominent */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6 animate-fade-in border-4 border-blue-500">
          <div className={`bg-gradient-to-r ${getConfidenceColor(primaryOutcome.confidence_score)} p-6 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90 uppercase tracking-wide">Primary Diagnosis</p>
                  <p className="text-xs text-white/80">Highest Confidence</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full border-2 ${getConfidenceBadgeColor(primaryOutcome.confidence_score)} bg-white/90 backdrop-blur-sm`}>
                <span className="text-lg font-bold">{primaryConfidencePercent}%</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {primaryOutcome.outcome_name}
            </h2>
            <p className="text-sm text-white/90 font-mono">
              {primaryOutcome.outcome_code}
            </p>
            </div>

          <div className="p-8 space-y-6">
            {/* Confidence Bar - Enhanced */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Confidence Level</span>
                <span className="text-sm font-bold text-gray-900">{primaryConfidencePercent}%</span>
              </div>
              <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getConfidenceColor(primaryOutcome.confidence_score)} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                  style={{ width: `${primaryConfidencePercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                </div>
              </div>
            </div>

            {/* Treatment */}
            <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-green-600"
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
                Recommended Treatment
              </h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {primaryOutcome.treatment || "No specific treatment information provided."}
              </p>
            </div>

            {/* Prevention */}
            <div className="bg-amber-50 rounded-xl p-6 border-l-4 border-amber-500">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                    <svg
                  className="w-6 h-6 mr-2 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                    >
                      <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                Prevention
              </h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {primaryOutcome.prevention || "No specific prevention guidance provided."}
              </p>
            </div>
              </div>
            </div>

        {/* All Outcomes Grid */}
        {sortedOutcomes.length > 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                  <svg
                className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
              <h3 className="text-2xl font-bold text-gray-900">
                All Possible Outcomes
                </h3>
              <span className="ml-auto px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {sortedOutcomes.length} total
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedOutcomes.map((outcome, index) => {
                const confidencePercent = (outcome.confidence_score * 100).toFixed(1);
                const isPrimary = index === 0;
                
                return (
                    <div
                    key={outcome.outcome_id}
                    className={`rounded-xl p-6 border-2 transition-all hover:shadow-lg ${
                      isPrimary
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 ring-2 ring-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isPrimary && (
                            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                              PRIMARY
                            </span>
                          )}
                          <h4 className={`font-bold ${isPrimary ? 'text-xl text-gray-900' : 'text-lg text-gray-800'}`}>
                            {outcome.outcome_name}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 font-mono mb-3">
                          {outcome.outcome_code}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full border-2 text-sm font-bold ${getConfidenceBadgeColor(outcome.confidence_score)}`}>
                        {confidencePercent}%
                      </div>
                    </div>
                    
                    {/* Confidence Bar */}
                    <div className="mb-4">
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getConfidenceColor(outcome.confidence_score)} rounded-full transition-all duration-1000`}
                          style={{ width: `${confidencePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Treatment Preview */}
                    {outcome.treatment && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                          Treatment
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {outcome.treatment}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Link
                href="/diagnosis/check"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 text-center shadow-md hover:shadow-lg"
              >
                Check New Symptoms
              </Link>
              <Link
                href="/diagnosis/history"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 text-center"
              >
                View History
              </Link>
        </div>
      </div>
    </div>
  );
}

export default function DiagnosisResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <DiagnosisResultContent />
    </Suspense>
  );
}

