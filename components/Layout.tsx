// Main layout component with navigation
"use client";

import { Navbar } from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Responsive Navigation */}
      <Navbar />

      {/* Main Content with padding for fixed navbar */}
      <main className="flex-1 pt-16 md:pt-20">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm md:text-base text-gray-600">
              © 2025 Red Rose Symptom Checker. All rights reserved.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              AI-powered symptom diagnosis and health tracking
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
