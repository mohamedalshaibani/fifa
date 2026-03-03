"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { 
  Trophy, LogOut, User, Settings, Menu, X, LogIn, UserPlus
} from "lucide-react";
import HeaderButton from "@/components/HeaderButton";
import SportButton from "@/components/ui/SportButton";

type HeaderUser = {
  id: string;
  email: string | null;
  firstName?: string | null;
};

type GlobalHeaderProps = {
  initialUser?: HeaderUser | null;
  initialIsAdmin?: boolean;
};

export default function GlobalHeader({
  initialUser = null,
  initialIsAdmin = false,
}: GlobalHeaderProps) {
  const [user, setUser] = useState<HeaderUser | null>(initialUser);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Build login URL with redirect to current page (unless already on auth pages)
  const loginUrl = pathname && !pathname.startsWith("/auth") && !pathname.startsWith("/admin")
    ? `/auth/login?redirect=${encodeURIComponent(pathname)}`
    : "/auth/login";

  useEffect(() => {
    const supabase = createClient();

    const syncAdmin = async () => {
      const response = await fetch("/api/admin/check", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        setIsAdmin(false);
        return;
      }

      const data = (await response.json()) as { isAdmin: boolean };
      setIsAdmin(data.isAdmin);
    };

    const syncUser = async () => {
      const { data } = await supabase.auth.getUser();
      let firstName: string | null = null;
      if (data.user?.user_metadata) {
        const meta = data.user.user_metadata as { full_name?: string; first_name?: string };
        if (meta.first_name) {
          firstName = meta.first_name;
        } else if (meta.full_name) {
          firstName = meta.full_name.split(" ")[0];
        }
      }
      const currentUser = data.user
        ? { id: data.user.id, email: data.user.email ?? null, firstName: firstName ?? null }
        : null;
      setUser(currentUser);
      await syncAdmin();
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      let firstName: string | null = null;
      if (session?.user?.user_metadata) {
        const meta = session.user.user_metadata as { full_name?: string; first_name?: string };
        if (meta.first_name) {
          firstName = meta.first_name;
        } else if (meta.full_name) {
          firstName = meta.full_name.split(" ")[0];
        }
      }
      const sessionUser = session?.user
        ? { id: session.user.id, email: session.user.email ?? null, firstName: firstName ?? null }
        : null;
      setUser(sessionUser);
      setIsAdmin(false);
      if (sessionUser) {
        void syncAdmin();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setShowMobileMenu(false);
    router.push("/");
  };

  void pathname;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-gradient-to-b from-[#E8DDD2] via-[#FFFFFF]/20 to-transparent backdrop-blur-md">
      {/* dir="ltr" forces standard left-to-right flex behavior, then we position manually */}
      <div dir="ltr" className="container-responsive h-16 flex items-center justify-between gap-4">
        
        {/* LEFT ZONE: Actions (Desktop) / Hamburger (Mobile) */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle - lg:hidden = visible on mobile/tablet, hidden on desktop */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-muted hover:text-foreground hover:bg-surface-alt transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Desktop Navigation - hidden lg:flex = visible only on desktop */}
          <nav className="hidden lg:flex items-center gap-3">
            {!user && (
              <>
                <HeaderButton
                  href={loginUrl}
                  variant="outline"
                  icon={LogIn}
                >
                  دخول
                </HeaderButton>
                <HeaderButton
                  href="/auth/register"
                  variant="secondary"
                  icon={UserPlus}
                >
                  تسجيل
                </HeaderButton>
              </>
            )}
            {user && (
              <>
                {/* Logout first (leftmost in LTR container) */}
                <HeaderButton
                  variant="danger"
                  icon={LogOut}
                  onClick={handleLogout}
                >
                  تسجيل خروج
                </HeaderButton>
                {/* Admin Panel second */}
                {isAdmin && (
                  <HeaderButton
                    href="/admin"
                    variant="primary"
                    icon={Settings}
                  >
                    لوحة الأدمن
                  </HeaderButton>
                )}
                {/* Account third (rightmost, closest to logo) */}
                <HeaderButton
                  href="/account"
                  variant="ghost"
                  icon={User}
                >
                  حسابي
                </HeaderButton>
              </>
            )}
          </nav>
        </div>

        {/* RIGHT ZONE: Logo/Brand */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="hidden sm:flex flex-col items-end">
            <h1 className="text-lg font-black leading-none heading-tight text-foreground">
              بطولات <span className="text-primary">فيفا</span>
            </h1>
            <span className="text-[11px] font-semibold text-muted mt-1">
              منصة تحديات الأبطال
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Trophy className="h-5 w-5" />
          </div>
        </Link>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-surface border-b border-border p-4 shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2">
            {!user && (
              <div className="flex flex-col gap-2">
                <HeaderButton
                  href={loginUrl}
                  onClick={() => setShowMobileMenu(false)}
                  variant="outline"
                  icon={LogIn}
                  fullWidth
                >
                  دخول
                </HeaderButton>
                <HeaderButton
                  href="/auth/register"
                  onClick={() => setShowMobileMenu(false)}
                  variant="secondary"
                  icon={UserPlus}
                  fullWidth
                >
                  تسجيل
                </HeaderButton>
              </div>
            )}

            {user && (
              <div className="flex flex-col gap-2">
                {/* Account first (top of mobile menu) */}
                <HeaderButton
                  href="/account"
                  onClick={() => setShowMobileMenu(false)}
                  variant="ghost"
                  icon={User}
                  fullWidth
                >
                  حسابي
                </HeaderButton>
                {/* Admin Panel second */}
                {isAdmin && (
                  <HeaderButton
                    href="/admin"
                    onClick={() => setShowMobileMenu(false)}
                    variant="primary"
                    icon={Settings}
                    fullWidth
                  >
                    لوحة الأدمن
                  </HeaderButton>
                )}
                {/* Logout last (bottom - destructive action) */}
                <HeaderButton
                  variant="danger"
                  icon={LogOut}
                  onClick={handleLogout}
                  fullWidth
                >
                  تسجيل خروج
                </HeaderButton>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
