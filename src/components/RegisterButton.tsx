"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n";

// Map server error messages to translation keys
const errorKeyMap: Record<string, string> = {
  "يجب تسجيل الدخول للتسجيل في البطولة": "registration.loginRequired",
  "البطولة غير موجودة": "registration.tournamentNotFound",
  "التسجيل مغلق حالياً": "registration.closed",
  "حدث خطأ أثناء التسجيل": "registration.error",
};

interface RegisterButtonProps {
  tournamentId: string;
  tournamentSlug: string;
  registerAction: (formData: FormData) => Promise<{ success: boolean; error?: string; alreadyRegistered?: boolean }>;
}

export default function RegisterButton({
  tournamentId,
  tournamentSlug,
  registerAction,
}: RegisterButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  // Translate server error or return as-is
  const translateError = (err: string): string => {
    const key = errorKeyMap[err];
    return key ? t(key as any) : err;
  };

  const handleSubmit = () => {
    setError(null);
    
    const formData = new FormData();
    formData.append("tournamentId", tournamentId);
    formData.append("tournamentSlug", tournamentSlug);
    
    startTransition(async () => {
      try {
        const result = await registerAction(formData);
        
        if (result.success) {
          // Registration succeeded, refresh the page
          router.refresh();
        } else if (result.alreadyRegistered) {
          // Already registered, just refresh
          router.refresh();
        } else if (result.error) {
          setError(translateError(result.error));
        }
      } catch (err) {
        console.error("Registration error:", err);
        setError(t("common.error"));
      }
    });
  };

  return (
    <div>
      <Button 
        type="button" 
        size="lg"
        onClick={handleSubmit}
        disabled={isPending}
      >
        {isPending ? t("registration.registering") : t("registration.registerMe")} 🎮
      </Button>
      {error && (
        <p className="text-sm text-danger mt-2">{error}</p>
      )}
    </div>
  );
}
