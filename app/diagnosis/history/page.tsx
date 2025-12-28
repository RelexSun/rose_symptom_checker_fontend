// Diagnosis history page - server component to fetch and display history
import { diagnosisApiServer } from '@/lib/api-server';
import { DiagnosisHistory } from '@/components/DiagnosisHistory';
import { auth } from '@/lib/auth';
import type { DiagnosisHistoryResponse } from '@/types';

// Revalidate this page every 30 seconds
export const revalidate = 30;

export default async function DiagnosisHistoryPage() {
  const session = await auth();
  const token = (session as any)?.token;
  
  let history: DiagnosisHistoryResponse = { total: 0, items: [] };
  let error: string | null = null;

  try {
    history = await diagnosisApiServer.getHistory(token);
  } catch (err: any) {
    error = err.message || 'Failed to load diagnosis history';
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Diagnosis History
        </h1>
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <DiagnosisHistory diagnoses={history.items} />
        )}
      </div>
    </div>
  );
}

