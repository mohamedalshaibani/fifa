import { Suspense } from "react";
import Container from "@/components/Container";
import SportPageLayout from "@/components/SportPageLayout";
import LoginForm from "@/app/admin/login/LoginForm";
import Link from "next/link";
import SportCard from "@/components/ui/SportCard";
import { Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <SportPageLayout>
      <Container>
        <div className="min-h-screen flex items-center justify-center py-12 md:py-16">
          {/* Page Header */}
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-secondary/10 border border-secondary/40">
                <Lock className="w-8 h-8 text-secondary" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-primary">
                تسجيل الدخول
              </h1>
              <p className="text-lg text-muted">
                ادخل إلى حسابك والبدء بالمنافسة
              </p>
            </div>

            {/* Login Card */}
            <SportCard padding="lg" variant="elevated">
              <Suspense fallback={<div className="py-8 text-center text-muted">جاري التحميل...</div>}>
                <LoginForm />
              </Suspense>
              <div className="mt-6 text-center text-sm text-muted border-t border-border pt-6">
                ليس لديك حساب؟{" "}
                <Link
                  href="/auth/register"
                  className="text-secondary font-bold hover:text-secondary-light transition-colors"
                >
                  تسجيل جديد
                </Link>
              </div>
            </SportCard>
          </div>
        </div>
      </Container>
    </SportPageLayout>
  );
}
