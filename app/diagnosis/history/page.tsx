// Diagnosis history page - server component to fetch and display history
import { diagnosisApiServer } from "@/lib/api-server";
import { DiagnosisHistory } from "@/components/DiagnosisHistory";
import { Pagination } from "@/components/Pagination";
import { auth } from "@/lib/auth";
import type { DiagnosisHistoryResponse } from "@/types";
import Link from "next/link";

// Revalidate this page every 30 seconds
export const revalidate = 30;

interface DiagnosisHistoryPageProps {
  searchParams: {
    skip?: string;
    limit?: string;
  };
}

export default async function DiagnosisHistoryPage({
  searchParams,
}: DiagnosisHistoryPageProps) {
  const session = await auth();
  const token = session?.token || (session as any)?.token;

  // Parse pagination parameters
  const skip = searchParams.skip ? parseInt(searchParams.skip, 10) : 0;
  const limit = searchParams.limit ? parseInt(searchParams.limit, 10) : 10;

  let history: DiagnosisHistoryResponse = { total: 0, items: [] };
  let error: string | null = null;

  if (!token) {
    error =
      "Authentication required. Please sign in to view your diagnosis history.";
  } else {
    try {
      history = await diagnosisApiServer.getHistory(token, skip, limit);
    } catch (err: any) {
      console.error("Failed to load diagnosis history:", err);
      error =
        err?.message ||
        "Failed to load diagnosis history. Please try again later.";
    }
  }

  // Use pagination metadata from backend response
  // Calculate current page from skip for display purposes only
  const currentPage = history.page ?? skip / limit + 1;
  const totalPages = history.total_pages ?? 1;
  const itemsPerPage = history.limit ?? limit;

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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium mb-2">{error}</p>
            {error.includes("Authentication") && (
              <Link
                href="/auth/signin"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Sign in to continue
              </Link>
            )}
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
