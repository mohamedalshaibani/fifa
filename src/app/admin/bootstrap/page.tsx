

"use client";
import Container from "@/components/Container";
import Card from "@/components/Card";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";

export default function AdminBootstrapPage() {
  const { t } = useLanguage();
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
        <h1 className="text-2xl font-semibold text-slate-900">{t("bootstrap.title")}</h1>
        <p className="text-sm text-slate-600">
          {t("bootstrap.description")}
        </p>
      </header>
      <Card>
        {loading ? (
          <div className="text-sm text-slate-600">{t("common.loading")}</div>
        ) : user ? (
          <div className="space-y-4">
            <div>
              <span className="font-medium">UID:</span>
              <span className="ml-2 select-all rounded bg-slate-100 px-2 py-1 text-xs font-mono">{user.id}</span>
            </div>
            <div>
              <span className="font-medium">{t("bootstrap.sqlLabel")}</span>
              <pre className="mt-2 rounded bg-slate-100 p-2 text-xs">{sql}</pre>
              <button
                className="mt-1 rounded bg-slate-200 px-2 py-1 text-xs hover:bg-slate-300"
                onClick={() => {
                  navigator.clipboard.writeText(sql);
                  setCopySql(true);
                  setTimeout(() => setCopySql(false), 1200);
                }}
              >
                {copySql ? t("bootstrap.copied") : t("bootstrap.copySQL")}
              </button>
            </div>
            <div className="text-sm text-slate-500">
              {t("bootstrap.manualHelp")}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-600">{t("bootstrap.loginFirst")}</div>
        )}
      </Card>
    </Container>
  );
}
