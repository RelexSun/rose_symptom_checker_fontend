// Home page - shows landing page for unauthenticated users, dashboard for authenticated
import { auth } from "@/lib/auth";
import Link from "next/link";
import { LandingPage } from "@/components/LandingPage";

// Revalidate home page every 30 seconds
export const revalidate = 30;

export default async function HomePage() {
  const session = await auth();

  // Show landing page for unauthenticated users
  if (!session) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-6 transition-transform">
              <svg
                className="w-12 h-12 text-white"
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Red Rose Symptom Checker
          </h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto">
            Get AI-powered symptom diagnosis and track your health history with
            confidence.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/diagnosis/check"
            className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:scale-105 hover-lift animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Check Symptoms
            </h2>
            <p className="text-gray-600 mb-4">
              Select your symptoms and get an instant AI-powered diagnosis with
              recommendations.
            </p>
            <span className="text-blue-600 font-semibold group-hover:translate-x-2 inline-block transition-transform">
              Get Started →
            </span>
          </Link>

          <Link
            href="/diagnosis/history"
            className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:scale-105 hover-lift animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg
                className="w-8 h-8 text-white"
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
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              View History
            </h2>
            <p className="text-gray-600 mb-4">
              Review your past diagnoses and track your health journey over
              time.
            </p>
            <span className="text-purple-600 font-semibold group-hover:translate-x-2 inline-block transition-transform">
              View History →
            </span>
          </Link>
        </div>

        {/* Features */}
        <div
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Why Choose Our Symptom Checker?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="text-2xl mb-2">🤖</div>
              <p className="text-sm font-medium text-gray-700">AI-Powered</p>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm font-medium text-gray-700">
                Instant Results
              </p>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm font-medium text-gray-700">Track History</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
