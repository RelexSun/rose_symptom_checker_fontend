// Diagnosis detail page - server component to fetch and display single diagnosis
import { diagnosisApiServer } from '@/lib/api-server';
import { DiagnosisDetail } from '@/components/DiagnosisDetail';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import type { DiagnosisResponse } from '@/types';

// Revalidate this page every 60 seconds (diagnosis details change less frequently)
export const revalidate = 60;

interface DiagnosisDetailPageProps {
  params: {
    id: string;
  };
}

export default async function DiagnosisDetailPage({
  params,
}: DiagnosisDetailPageProps) {
  const session = await auth();
  const token = (session as any)?.token;
  
  let diagnosis: DiagnosisResponse | null = null;
  let error: string | null = null;

  try {
    diagnosis = await diagnosisApiServer.getById(params.id, token);
  } catch (err: any) {
    error = err.message || 'Failed to load diagnosis';
    if (err.message?.includes('404') || err.message?.includes('not found')) {
      notFound();
    }
  }

  if (!diagnosis && !error) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : diagnosis ? (
          <DiagnosisDetail diagnosis={diagnosis} />
        ) : null}
      </div>
    </div>
  );
}

