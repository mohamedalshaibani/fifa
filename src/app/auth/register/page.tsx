"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AvatarSelector from "@/components/AvatarSelector";
import { Avatar } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Container from "@/components/Container";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const getFallbackAvatars = (): Avatar[] => [];

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

  // UI state
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingAvatars, setLoadingAvatars] = useState(true);

  // Load avatars on mount
  useEffect(() => {
    const loadAvatars = async () => {
      try {
        const { data, error } = await supabase
          .from("avatars")
          .select("*")
          .order("category", { ascending: true })
          .order("name", { ascending: true });

        if (error) {
          console.warn("Avatar query error:", error);
          setAvatars([]);
        } else if (data && data.length > 0) {
          setAvatars(data);
        } else {
          setAvatars([]);
        }
      } catch (err) {
        console.error("Failed to load avatars:", err);
        setAvatars([]);
      } finally {
        setLoadingAvatars(false);
      }
    };

    loadAvatars();
  }, []);

  // Form validation
  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      setError("الاسم الأول مطلوب");
      return false;
    }
    if (!lastName.trim()) {
      setError("اسم العائلة مطلوب");
      return false;
    }
    if (!whatsapp.trim()) {
      setError("رقم الواتساب مطلوب");
      return false;
    }
    if (!email.includes("@")) {
      setError("البريد الإلكتروني غير صحيح");
      return false;
    }
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return false;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return false;
    }
    if (!selectedAvatarId) {
      setError("يرجى اختيار صورة رمزية");
      return false;
    }
    return true;
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1. Sign up user with auto-confirm (no email verification)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Skip email verification - user is immediately confirmed
          emailRedirectTo: undefined,
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("فشل التسجيل");

      // 2. Create user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert([
          {
            id: authData.user.id,
            first_name: firstName,
            last_name: lastName,
            whatsapp_number: whatsapp,
            email,
            avatar_id: selectedAvatarId,
            avatar_url: avatars.find((a) => a.id === selectedAvatarId)
              ?.image_url,
          },
        ]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Continue anyway - user was created
      }

      // Auto-login after registration - redirect directly to homepage
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "فشل التسجيل. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingAvatars) {
    return (
      <div className="min-h-screen bg-background">
        <Container>
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-sm text-muted">جارٍ تحميل الصور الرمزية...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Container>
        <div className="max-w-3xl mx-auto py-12" dir="rtl">
          {/* Header */}
          <header className="mb-8 space-y-2 text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
              إنشاء حساب لاعب
            </h1>
            <p className="text-sm text-muted">
              انضم إلى البطولات وابنِ ملفك التنافسي
            </p>
          </header>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Registration form */}
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-surface-2/80 backdrop-blur-md border border-border p-6 rounded-2xl shadow-[0_8px_30px_rgba(5,8,22,0.08)]">
              <h2 className="text-lg font-bold text-foreground mb-4">
                المعلومات الشخصية
              </h2>

              <div className="space-y-4">
                {/* First & Last Name - RTL: First name on right */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="الاسم الأول"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="أدخل اسمك الأول"
                    disabled={loading}
                  />
                  <Input
                    label="اسم العائلة"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="أدخل اسم العائلة"
                    disabled={loading}
                  />
                </div>

                {/* Email & WhatsApp */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="البريد الإلكتروني"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                  <Input
                    label="رقم الواتساب"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+971 XX XXX XXXX"
                    disabled={loading}
                  />
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="كلمة المرور"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8 أحرف على الأقل"
                    disabled={loading}
                  />
                  <Input
                    label="تأكيد كلمة المرور"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Avatar Selection */}
            <div className="bg-surface-2/80 backdrop-blur-md border border-border p-6 rounded-2xl shadow-[0_8px_30px_rgba(5,8,22,0.08)]">
              <h2 className="text-lg font-bold text-foreground mb-4">
                اختر صورتك الرمزية
              </h2>
              <AvatarSelector
                avatars={avatars}
                selectedAvatarId={selectedAvatarId}
                onSelectAvatar={setSelectedAvatarId}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب والتسجيل"}
            </Button>

            {/* Login link */}
            <p className="text-center text-sm text-muted">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/auth/login"
                className="text-secondary font-bold hover:text-secondary-dark hover:underline"
              >
                سجل الدخول من هنا
              </Link>
            </p>
          </form>
        </div>
      </Container>
    </div>
  );
}
