// Diagnosis history page - server component to fetch and display history
import { diagnosisApiServer } from "@/lib/api-server";
import { DiagnosisHistory } from "@/components/DiagnosisHistory";
import { Pagination } from "@/components/Pagination";
import { auth } from "@/lib/auth";
import type { DiagnosisHistoryResponse } from "@/types";

// Revalidate this page every 30 seconds
export const revalidate = 30;

interface DiagnosisHistoryPageProps {
  searchParams: {
    page?: string;
    limit?: string;
  };
}

export default async function DiagnosisHistoryPage({
  searchParams,
}: DiagnosisHistoryPageProps) {
  const session = await auth();
  const token = (session as any)?.token;

  // Parse pagination parameters
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const limit = searchParams.limit ? parseInt(searchParams.limit, 10) : 10;

  // Validate pagination parameters
  const validPage = page > 0 ? page : 1;
  const validLimit = limit > 0 && limit <= 100 ? limit : 10;

  // Calculate skip from page (page 1 = skip 0, page 2 = skip 10, etc.)
  const skip = (validPage - 1) * validLimit;

  let history: DiagnosisHistoryResponse = { total: 0, items: [] };
  let error: string | null = null;

  try {
    history = await diagnosisApiServer.getHistory(token, skip, validLimit);
  } catch (err: any) {
    error = err.message || "Failed to load diagnosis history";
  }

  // Calculate pagination metadata
  const totalPages = Math.ceil(history.total / validLimit);
  const currentPage = validPage;
  const itemsPerPage = validLimit;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Diagnosis History
          </h1>
          {history.total > 0 && (
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {history.total} total
            </span>
          )}
        </div>
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <>
            <DiagnosisHistory diagnoses={history.items} />
            {history.total > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={history.total}
                itemsPerPage={itemsPerPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

