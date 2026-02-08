// Diagnosis detail page - server component to fetch and display outcome details
import { outcomeApiServer } from "@/lib/api-server";
import { DiagnosisDetail } from "@/components/DiagnosisDetail";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Outcome } from "@/types";

// Revalidate this page every 60 seconds (outcome details change less frequently)
export const revalidate = 60;

interface OutcomeDetailPageProps {
  params: {
    id: string;
  };
}

export default async function OutcomeDetailPage({
  params,
}: OutcomeDetailPageProps) {
  const session = await auth();
  const token = (session as any)?.token;

  let outcome: Outcome | null = null;
  let error: string | null = null;

  try {
    // Fetch outcome details directly using the outcome_id from URL
    outcome = await outcomeApiServer.getById(params.id, token);
  } catch (err: any) {
    console.error("Failed to load outcome:", err);
    const errorMessage =
      err?.message ||
      err?.response?.data?.message ||
      "Failed to load outcome details";
    error = errorMessage;

    // Check for 404 errors
    if (
      err?.response?.status === 404 ||
      errorMessage?.includes("404") ||
      errorMessage?.toLowerCase().includes("not found")
    ) {
      notFound();
    }
  }

  if (!outcome && !error) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium mb-2">Error loading outcome details</p>
            <p className="text-sm">{error}</p>
            <Link
              href="/diagnosis/history"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 underline font-medium"
            >
              ← Back to History
            </Link>
          </div>
        ) : outcome ? (
          <DiagnosisDetail outcome={outcome} />
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            <p>No outcome data available.</p>
            <Link
              href="/diagnosis/history"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 underline font-medium"
            >
              ← Back to History
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
