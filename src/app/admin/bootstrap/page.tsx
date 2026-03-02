

"use client";
import Container from "@/components/Container";
import Card from "@/components/Card";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminBootstrapPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copySql, setCopySql] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const sql = user ? `insert into public.admins (user_id) values ('${user.id}');` : "";

  return (
    <Container>
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">تهيئة المشرف</h1>
        <p className="text-sm text-slate-600">
          أول مستخدم يسجل دخوله سيصبح مشرفًا تلقائيًا إذا كان جدول المشرفين فارغًا.<br />
          لا حاجة لأي خطوات إضافية.
        </p>
      </header>
      <Card>
        {loading ? (
          <div className="text-sm text-slate-600">جاري التحميل...</div>
        ) : user ? (
          <div className="space-y-4">
            <div>
              <span className="font-medium">UID:</span>
              <span className="ml-2 select-all rounded bg-slate-100 px-2 py-1 text-xs font-mono">{user.id}</span>
            </div>
            <div>
              <span className="font-medium">SQL لإضافتك كمشرف يدويًا (عند الحاجة):</span>
              <pre className="mt-2 rounded bg-slate-100 p-2 text-xs">{sql}</pre>
              <button
                className="mt-1 rounded bg-slate-200 px-2 py-1 text-xs hover:bg-slate-300"
                onClick={() => {
                  navigator.clipboard.writeText(sql);
                  setCopySql(true);
                  setTimeout(() => setCopySql(false), 1200);
                }}
              >
                {copySql ? "تم النسخ!" : "نسخ SQL"}
              </button>
            </div>
            <div className="text-sm text-slate-500">
              إذا واجهت مشكلة في التهيئة التلقائية، انسخ هذا المعرف ونفذ SQL يدويًا.
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-600">سجّل الدخول أولاً.</div>
        )}
      </Card>
    </Container>
  );
}
