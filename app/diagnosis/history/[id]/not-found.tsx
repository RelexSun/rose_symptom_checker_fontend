// Not found page for diagnosis detail
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Diagnosis Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The diagnosis you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/diagnosis/history"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to History
        </Link>
      </div>
    </div>
  );
}

