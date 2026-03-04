"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">💥</div>
          <h1 className="text-2xl font-bold text-gray-900">خطأ في التطبيق</h1>
          <p className="text-gray-600">
            نعتذر، حدث خطأ غير متوقع.
          </p>
          
          <div className="text-left p-4 bg-red-50 rounded-lg border border-red-200 overflow-auto">
            <p className="text-xs font-mono text-red-700 mb-2">
              <strong>Error:</strong> {error.name}
            </p>
            <p className="text-xs font-mono text-red-700 mb-2">
              <strong>Message:</strong> {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-red-700">
                <strong>Digest:</strong> {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              حاول مرة أخرى
            </button>
            <Link 
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300"
            >
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
