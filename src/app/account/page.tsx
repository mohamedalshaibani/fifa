"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container";
import SportCard from "@/components/ui/SportCard";
import SportButton from "@/components/ui/SportButton";
import AvatarSelector from "@/components/AvatarSelector";
import { User, Palette, BarChart3, Lock, ArrowRight, Check } from "lucide-react";
import { Avatar as AvatarType } from "@/lib/types";

type Tab = "profile" | "avatar" | "stats" | "password";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // User data
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<{
    first_name: string;
    last_name: string;
    whatsapp_number: string;
    avatar_url: string;
    avatar_id: string;
  }>({
    first_name: "",
    last_name: "",
    whatsapp_number: "",
    avatar_url: "",
    avatar_id: "",
  });
  const [avatars, setAvatars] = useState<AvatarType[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          window.location.href = "/auth/login";
          return;
        }
        setUser({ id: currentUser.id, email: currentUser.email || "" });

        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("first_name, last_name, whatsapp_number, avatar_url, avatar_id")
          .eq("id", currentUser.id)
          .single();
        
        if (profileData) {
          setProfile({
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
            whatsapp_number: profileData.whatsapp_number || "",
            avatar_url: profileData.avatar_url || "",
            avatar_id: profileData.avatar_id || "",
          });
          setSelectedAvatarId(profileData.avatar_id || null);
        }

        // Try to load avatars from DB
        const { data: avatarsData, error: avatarsError } = await supabase
          .from("avatars")
          .select("*")
          .order("category")
          .order("name");
        
        console.log("Avatars from DB:", avatarsData, "Error:", avatarsError);
        
        if (avatarsData && avatarsData.length > 0) {
          setAvatars(avatarsData as AvatarType[]);
        } else {
          console.log("No avatars found in DB");
          setAvatars([]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        // On error, set empty avatars array
        setAvatars([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleProfileSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        id: user.id,
        email: user.email,
        first_name: profile.first_name || "مستخدم",
        last_name: profile.last_name || "جديد",
        whatsapp_number: profile.whatsapp_number || "",
        avatar_url: profile.avatar_url || null,
      };
      console.log("Saving profile:", payload);
      
      const { data, error } = await supabase
        .from("user_profiles")
        .upsert(payload)
        .select();
      
      if (error) {
        console.error("Supabase error:", error.message, error.details, error.hint);
        throw error;
      }
      console.log("Profile saved:", data);
      showMessage("success", "تم حفظ الملف الشخصي بنجاح");
    } catch (error: unknown) {
      const err = error as { message?: string; details?: string };
      showMessage("error", err.message || "فشل في حفظ الملف الشخصي");
      console.error("Full error:", JSON.stringify(error, null, 2));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSave = async () => {
    if (!user || !selectedAvatarId) return;
    setSaving(true);
    try {
      // Find the selected avatar to get its URL
      const selectedAvatar = avatars.find(a => a.id === selectedAvatarId);
      const avatarUrl = selectedAvatar?.image_url || "";
      
      const { error } = await supabase
        .from("user_profiles")
        .update({ 
          avatar_id: selectedAvatarId,
          avatar_url: avatarUrl 
        })
        .eq("id", user.id);
      
      if (error) throw error;
      setProfile(prev => ({ ...prev, avatar_id: selectedAvatarId, avatar_url: avatarUrl }));
      showMessage("success", "تم تغيير الصورة الرمزية بنجاح");
    } catch (error) {
      showMessage("error", "فشل في تغيير الصورة الرمزية");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showMessage("error", "كلمات المرور غير متطابقة");
      return;
    }
    if (newPassword.length < 6) {
      showMessage("error", "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage("success", "تم تغيير كلمة المرور بنجاح");
    } catch (error) {
      showMessage("error", "فشل في تغيير كلمة المرور");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "الملف الشخصي", icon: User },
    { id: "avatar", label: "الصورة الرمزية", icon: Palette },
    { id: "stats", label: "إحصائياتي", icon: BarChart3 },
    { id: "password", label: "كلمة المرور", icon: Lock },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-foreground font-bold">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <Container>
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header Card */}
          <SportCard padding="lg" variant="elevated">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-3 border-primary shadow-md flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {profile.avatar_url && profile.avatar_url.startsWith("http") ? (
                  <Image 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    width={96} 
                    height={96} 
                    className="object-cover w-full h-full" 
                  />
                ) : profile.avatar_url ? (
                  <span className="text-4xl">{profile.avatar_url}</span>
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-3xl text-white font-bold">
                    {profile.first_name?.[0] || "؟"}
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-right">
                <h1 className="text-xl md:text-2xl font-black text-foreground mb-1">
                  {profile.first_name && profile.last_name 
                    ? `${profile.first_name} ${profile.last_name}` 
                    : "مستخدم جديد"}
                </h1>
                <p className="text-muted text-sm md:text-base">{user?.email}</p>
              </div>
              
              {/* Back Link */}
              <Link href="/">
                <SportButton variant="ghost" size="sm">
                  <ArrowRight className="w-4 h-4" />
                  العودة
                </SportButton>
              </Link>
            </div>
          </SportCard>

          {/* Message Toast - Inline Alert */}
          {message && (
            <div 
              className={`flex items-center gap-3 px-5 py-4 rounded-xl font-bold shadow-md border-2 ${
                message.type === "success" 
                  ? "bg-success/10 border-success/30 text-success-dark" 
                  : "bg-danger/10 border-danger/30 text-danger"
              }`}
              style={{
                backgroundColor: message.type === "success" ? "#E8FFF0" : "#FFF0F0",
                borderColor: message.type === "success" ? "#00E676" : "#FF3B4E",
                color: message.type === "success" ? "#00864A" : "#CC2233",
              }}
            >
              <span className="text-xl">{message.type === "success" ? "✓" : "✕"}</span>
              <span>{message.text}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <SportButton
                  key={tab.id}
                  variant={isActive ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </SportButton>
              );
            })}
          </div>

          {/* Content Card */}
          <SportCard padding="lg" variant="elevated">
            
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-foreground">تعديل الملف الشخصي</h2>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-secondary font-semibold mb-2 text-sm">الاسم الأول</label>
                    <input
                      type="text"
                      value={profile.first_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="أدخل الاسم الأول"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-secondary font-semibold mb-2 text-sm">الاسم الأخير</label>
                    <input
                      type="text"
                      value={profile.last_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="أدخل الاسم الأخير"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-secondary font-semibold mb-2 text-sm">رقم الواتساب</label>
                    <input
                      type="tel"
                      value={profile.whatsapp_number}
                      onChange={(e) => setProfile(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="+966 5X XXX XXXX"
                      dir="ltr"
                    />
                  </div>
                </div>
                <SportButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleProfileSave}
                  disabled={saving}
                  isLoading={saving}
                >
                  {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </SportButton>
              </div>
            )}

            {/* Avatar Tab */}
            {activeTab === "avatar" && (
              <div className="space-y-8">
                {/* Current Avatar Section */}
                <div className="text-center pb-6 border-b border-border">
                  <p className="text-sm font-semibold text-muted mb-3">الصورة الحالية</p>
                  <div 
                    className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-primary shadow-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #F0F4FF 0%, #E2E8F0 100%)" }}
                  >
                    {profile.avatar_url && profile.avatar_url.startsWith("http") ? (
                      <Image 
                        src={profile.avatar_url} 
                        alt="Current Avatar" 
                        width={96} 
                        height={96} 
                        className="object-cover w-full h-full" 
                      />
                    ) : profile.avatar_url ? (
                      <span className="text-4xl">{profile.avatar_url}</span>
                    ) : (
                      <span className="text-3xl font-bold text-primary">{profile.first_name?.[0] || "؟"}</span>
                    )}
                  </div>
                </div>

                {/* Avatar Selection using shared component */}
                <div>
                  <h2 className="text-lg font-black text-foreground mb-4">اختر صورة جديدة</h2>
                  {avatars.length > 0 ? (
                    <AvatarSelector
                      avatars={avatars}
                      selectedAvatarId={selectedAvatarId}
                      onSelectAvatar={(id) => setSelectedAvatarId(id)}
                      showCategories={true}
                    />
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <div className="text-5xl mb-4">🎨</div>
                      <p className="text-muted font-semibold">لا توجد صور رمزية متاحة</p>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <SportButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleAvatarSave}
                    disabled={saving || !selectedAvatarId || selectedAvatarId === profile.avatar_id}
                    isLoading={saving}
                  >
                    {saving ? "جاري الحفظ..." : "حفظ الصورة الرمزية"}
                  </SportButton>
                  {selectedAvatarId && selectedAvatarId !== profile.avatar_id && (
                    <p className="text-center text-sm text-success mt-2 font-semibold">
                      ✓ تم اختيار صورة جديدة
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-foreground">إحصائياتي</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "المباريات", value: "0", icon: "⚽", variant: "highlighted" as const },
                    { label: "الانتصارات", value: "0", icon: "🏆", variant: "success" as const },
                    { label: "التعادلات", value: "0", icon: "🤝", variant: "warning" as const },
                    { label: "الخسائر", value: "0", icon: "😢", variant: "danger" as const },
                  ].map((stat, i) => (
                    <SportCard key={i} padding="base" variant={stat.variant}>
                      <div className="text-center">
                        <div className="text-3xl mb-2">{stat.icon}</div>
                        <div className="text-2xl font-black text-foreground">{stat.value}</div>
                        <div className="text-sm text-muted font-semibold">{stat.label}</div>
                      </div>
                    </SportCard>
                  ))}
                </div>
                <p className="text-muted text-center text-sm">
                  الإحصائيات قادمة قريباً...
                </p>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-foreground">تغيير كلمة المرور</h2>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-secondary font-semibold mb-2 text-sm">كلمة المرور الحالية</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-secondary font-semibold mb-2 text-sm">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-secondary font-semibold mb-2 text-sm">تأكيد كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <SportButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handlePasswordChange}
                  disabled={saving || !newPassword || !confirmPassword}
                  isLoading={saving}
                >
                  {saving ? "جاري التغيير..." : "تغيير كلمة المرور"}
                </SportButton>
              </div>
            )}
          </SportCard>
        </div>
      </Container>
    </div>
  );
}

