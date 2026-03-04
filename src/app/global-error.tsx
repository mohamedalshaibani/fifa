"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  
  useEffect(() => {
    console.error("[Global Error]", error);
    // Try to detect language from localStorage
    const stored = localStorage.getItem("language");
    if (stored === "en" || stored === "ar") {
      setLang(stored);
    }
  }, [error]);

  const texts = {
    ar: {
      title: "خطأ في التطبيق",
      apology: "نعتذر، حدث خطأ غير متوقع.",
      tryAgain: "حاول مرة أخرى",
      home: "الصفحة الرئيسية",
    },
    en: {
      title: "Application Error",
      apology: "Sorry, an unexpected error occurred.",
      tryAgain: "Try Again",
      home: "Home",
    },
  };

  const t = texts[lang];

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <body className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">💥</div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600">
            {t.apology}
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
              {t.tryAgain}
            </button>
            <Link 
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300"
            >
              {t.home}
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
