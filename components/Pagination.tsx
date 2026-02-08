"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  basePath?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  basePath = "/diagnosis/history",
}: PaginationProps) {
  const searchParams = useSearchParams();
  
  // Build query string preserving other params, using skip/limit
  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const skip = (page - 1) * itemsPerPage;
    params.set("skip", skip.toString());
    params.set("limit", itemsPerPage.toString());
    return `${basePath}?${params.toString()}`;
  };

  // Calculate display range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("...");
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null; // Don't show pagination if only one page
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
      {/* Results info */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{startItem}</span> to{" "}
        <span className="font-semibold text-gray-900">{endItem}</span> of{" "}
        <span className="font-semibold text-gray-900">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Link
          href={buildUrl(currentPage - 1)}
          className={`px-4 py-2 rounded-lg border transition-all ${
            currentPage === 1
              ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
              : "border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 bg-white"
          }`}
          aria-disabled={currentPage === 1}
          onClick={(e) => currentPage === 1 && e.preventDefault()}
        >
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
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
            Previous
          </span>
        </Link>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-400"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Link
                key={pageNum}
                href={buildUrl(pageNum)}
                className={`min-w-[40px] px-3 py-2 rounded-lg border text-center transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 shadow-md font-semibold"
                    : "border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 bg-white"
                }`}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>

        {/* Next button */}
        <Link
          href={buildUrl(currentPage + 1)}
          className={`px-4 py-2 rounded-lg border transition-all ${
            currentPage === totalPages
              ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
              : "border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 bg-white"
          }`}
          aria-disabled={currentPage === totalPages}
          onClick={(e) => currentPage === totalPages && e.preventDefault()}
        >
          <span className="flex items-center gap-1">
            Next
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  );
}

