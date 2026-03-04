"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SportInput from "@/components/ui/SportInput";
import SportButton from "@/components/ui/SportButton";
import { useLanguage } from "@/lib/i18n";
import { Mail, Lock } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || t("auth.loginFailed"));
      setLoading(false);
      return;
    }

    const { data: adminRow } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", data.user?.id)
      .maybeSingle();

    const isAdmin = Boolean(adminRow?.user_id);

    // Get returnTo from URL params (check both 'returnTo' and 'redirect'), fallback to home page
    const returnTo = searchParams.get("returnTo") || searchParams.get("redirect");
    
    if (isAdmin) {
      router.replace("/admin/tournaments");
    } else if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
      // Validate returnTo is a safe internal path
      router.replace(returnTo);
    } else {
      router.replace("/");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <SportInput
        label={t("auth.email")}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="admin@example.com"
        icon={<Mail className="w-4 h-4" />}
        required
        autoComplete="email"
      />
      <SportInput
        label={t("auth.password")}
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="••••••••"
        icon={<Lock className="w-4 h-4" />}
        required
        autoComplete="current-password"
      />

      {error && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger font-bold text-center">
          {error}
        </div>
      )}

      <SportButton
        type="submit"
        variant="primary"
        size="lg"
        disabled={loading}
        isLoading={loading}
        className="w-full font-bold"
      >
        {loading ? t("auth.loggingIn") : t("auth.loginButton")}
      </SportButton>
    </form>
  );
}
