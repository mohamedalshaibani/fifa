"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { 
  Trophy, LogOut, User, Settings, Menu, X, LogIn, UserPlus
} from "lucide-react";
import HeaderButton from "@/components/HeaderButton";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/i18n";

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
  const { t, isRTL } = useLanguage();

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

  // Close mobile menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMobileMenu(false);
    };
    
    if (showMobileMenu) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [showMobileMenu]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-gradient-to-b from-[#E8DDD2] via-[#FFFFFF]/90 to-[#FFFFFF]/80 backdrop-blur-md">
        {/* Container: use dir attribute to control layout direction */}
        <div 
          dir={isRTL ? 'rtl' : 'ltr'}
          className="container-responsive h-16 flex items-center justify-between gap-4"
        >
          
          {/* LOGO ZONE: Logo/Brand - Always visible */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-90">
            {/* Logo Icon */}
            <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md flex-shrink-0">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            {/* Text - Responsive: smaller on mobile, full on desktop */}
            <div className="flex flex-col items-start rtl:items-end">
              <h1 className="text-sm sm:text-lg font-black leading-none heading-tight text-foreground">
                {t("header.platformName")}
              </h1>
              <span className="text-[8px] xs:text-[9px] sm:text-[11px] font-semibold text-muted mt-0.5 sm:mt-1">
                {t("header.platformSubtitle")}
              </span>
            </div>
          </Link>

          {/* ACTIONS ZONE: Actions (Desktop) / Hamburger (Mobile) */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle - lg:hidden = visible on mobile/tablet, hidden on desktop */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-foreground hover:text-primary hover:bg-primary/10 transition-colors lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Desktop Navigation - hidden lg:flex = visible only on desktop */}
            <nav className="hidden lg:flex items-center gap-3">
              {/* Language Toggle */}
              <LanguageToggle />
              
              {!user && (
              <>
                <HeaderButton
                  href={loginUrl}
                  variant="outline"
                  icon={LogIn}
                >
                  {t("header.login")}
                </HeaderButton>
                <HeaderButton
                  href="/auth/register"
                  variant="secondary"
                  icon={UserPlus}
                >
                  {t("header.register")}
                </HeaderButton>
              </>
            )}
            {user && (
              <>
                <HeaderButton
                  variant="danger"
                  icon={LogOut}
                  onClick={handleLogout}
                >
                  {t("header.logout")}
                </HeaderButton>
                {isAdmin && (
                  <HeaderButton
                    href="/admin"
                    variant="primary"
                    icon={Settings}
                  >
                    {t("header.adminPanel")}
                  </HeaderButton>
                )}
                <HeaderButton
                  href="/account"
                  variant="ghost"
                  icon={User}
                >
                  {t("header.myAccount")}
                </HeaderButton>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>

    {/* Mobile Menu Overlay - Full screen drawer */}
    {showMobileMenu && (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden animate-in fade-in duration-200"
          onClick={() => setShowMobileMenu(false)}
          aria-hidden="true"
        />
        
        {/* Menu Drawer */}
        <div className="fixed top-16 left-0 right-0 z-[70] lg:hidden overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="bg-white border-b border-border shadow-2xl animate-in slide-in-from-top-2 duration-200">
            {/* Close button row */}
            <div className={`container-responsive pt-4 pb-2 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
                aria-label={t("common.close")}
              >
                <X className="h-5 w-5" />
                <span>{t("common.close")}</span>
              </button>
            </div>
            
            <nav className="container-responsive pb-6 flex flex-col gap-3">
              {/* Language Toggle in Mobile Menu */}
              <div className="pb-3 mb-2 border-b border-border">
                <LanguageToggle />
              </div>
              
              {/* User greeting if logged in */}
              {user && (
                <div className="pb-4 mb-2 border-b border-border">
                  <p className="text-sm text-muted">{t("header.welcome")}</p>
                  <p className="text-lg font-bold text-foreground">
                    {user.firstName || user.email?.split("@")[0] || "User"}
                  </p>
                </div>
              )}

              {!user && (
                <>
                  <HeaderButton
                    href={loginUrl}
                    onClick={() => setShowMobileMenu(false)}
                    variant="primary"
                    icon={LogIn}
                    fullWidth
                  >
                    {t("header.login")}
                  </HeaderButton>
                  <HeaderButton
                    href="/auth/register"
                    onClick={() => setShowMobileMenu(false)}
                    variant="secondary"
                    icon={UserPlus}
                    fullWidth
                  >
                    {t("header.register")}
                  </HeaderButton>
                </>
              )}

              {user && (
                <>
                  {/* Account */}
                  <HeaderButton
                    href="/account"
                    onClick={() => setShowMobileMenu(false)}
                    variant="outline"
                    icon={User}
                    fullWidth
                  >
                    {t("header.myAccount")}
                  </HeaderButton>
                  
                  {/* Admin Panel */}
                  {isAdmin && (
                    <HeaderButton
                      href="/admin"
                      onClick={() => setShowMobileMenu(false)}
                      variant="primary"
                      icon={Settings}
                      fullWidth
                    >
                      {t("header.adminPanel")}
                    </HeaderButton>
                  )}
                  
                  {/* Divider */}
                  <div className="my-2 border-t border-border" />
                  
                  {/* Logout */}
                  <HeaderButton
                    variant="danger"
                    icon={LogOut}
                    onClick={handleLogout}
                    fullWidth
                  >
                    {t("header.logout")}
                  </HeaderButton>
                </>
              )}
            </nav>
          </div>
        </div>
      </>
    )}
    </>
  );
}
