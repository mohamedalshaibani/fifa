"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Container from "@/components/Container";
import BackLink from "@/components/BackLink";
import SportCard from "@/components/ui/SportCard";
import SportButton from "@/components/ui/SportButton";
import AvatarSelector from "@/components/AvatarSelector";
import { useLanguage } from "@/lib/i18n";
import { User, Palette, BarChart3, Lock } from "lucide-react";
import { Avatar as AvatarType } from "@/lib/types";

type Tab = "profile" | "avatar" | "stats" | "password";

export default function AccountPage() {
  const { t } = useLanguage();
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
  
  // User stats (enhanced)
  const [stats, setStats] = useState<{
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
    winRate: number;
    tournamentsParticipated: number;
    tournaments: Array<{
      tournamentId: string;
      tournamentName: string;
      tournamentStatus: string;
      matchesPlayed: number;
      wins: number;
      draws: number;
      losses: number;
      goalsScored: number;
      goalsConceded: number;
    }>;
  }>({ 
    matchesPlayed: 0, 
    wins: 0, 
    draws: 0, 
    losses: 0,
    goalsScored: 0,
    goalsConceded: 0,
    winRate: 0,
    tournamentsParticipated: 0,
    tournaments: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);

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

        // Parallelize data fetches for faster loading
        const [profileResult, avatarsResult, statsResult] = await Promise.allSettled([
          supabase
            .from("user_profiles")
            .select("first_name, last_name, whatsapp_number, avatar_url, avatar_id")
            .eq("id", currentUser.id)
            .single(),
          supabase
            .from("avatars")
            .select("*")
            .order("category")
            .order("name"),
          fetch("/api/user/stats")
        ]);
        
        // Handle profile data
        if (profileResult.status === "fulfilled" && profileResult.value.data) {
          const profileData = profileResult.value.data;
          setProfile({
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
            whatsapp_number: profileData.whatsapp_number || "",
            avatar_url: profileData.avatar_url || "",
            avatar_id: profileData.avatar_id || "",
          });
          setSelectedAvatarId(profileData.avatar_id || null);
        }

        // Handle avatars data
        if (avatarsResult.status === "fulfilled" && avatarsResult.value.data) {
          const avatarsData = avatarsResult.value.data;
          if (avatarsData.length > 0) {
            setAvatars(avatarsData as AvatarType[]);
          } else {
            setAvatars([]);
          }
        } else {
          setAvatars([]);
        }
        
        // Handle stats data
        if (statsResult.status === "fulfilled" && statsResult.value.ok) {
          try {
            const statsData = await statsResult.value.json();
            setStats(statsData);
          } catch {
            console.error("Error parsing stats response");
          }
        }
        setStatsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        // On error, set empty avatars array
        setAvatars([]);
        setStatsLoading(false);
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
        first_name: profile.first_name || t("account.newUser"),
        last_name: profile.last_name || "",
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
      showMessage("success", t("account.profileSaved"));
    } catch (error: unknown) {
      const err = error as { message?: string; details?: string };
      showMessage("error", err.message || t("account.profileSaveFailed"));
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
      showMessage("success", t("account.avatarChanged"));
    } catch (error) {
      showMessage("error", t("account.avatarChangeFailed"));
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showMessage("error", t("account.passwordsMismatch"));
      return;
    }
    if (newPassword.length < 6) {
      showMessage("error", t("account.passwordTooShort"));
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
      showMessage("success", t("account.passwordChanged"));
    } catch (error) {
      showMessage("error", t("account.passwordChangeFailed"));
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: t("account.profile"), icon: User },
    { id: "avatar", label: t("account.avatar"), icon: Palette },
    { id: "stats", label: t("account.stats"), icon: BarChart3 },
    { id: "password", label: t("account.password"), icon: Lock },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Back Link Skeleton */}
            <div className="h-5 w-16 bg-primary/10 rounded animate-pulse mb-6"></div>
            
            {/* Header Card Skeleton */}
            <div className="bg-white/80 rounded-2xl shadow-sm p-6 border border-primary/10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 animate-pulse"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-40 bg-primary/10 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-primary/5 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Tabs Skeleton */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-24 bg-primary/10 rounded-lg animate-pulse"></div>
              ))}
            </div>
            
            {/* Content Skeleton */}
            <div className="bg-white/80 rounded-2xl shadow-sm p-6 border border-primary/10">
              <div className="space-y-4">
                <div className="h-5 w-24 bg-primary/10 rounded animate-pulse"></div>
                <div className="h-12 w-full bg-primary/5 rounded-lg animate-pulse"></div>
                <div className="h-5 w-24 bg-primary/10 rounded animate-pulse"></div>
                <div className="h-12 w-full bg-primary/5 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <Container>
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Back Link - Unified styling */}
          <BackLink fallbackHref="/" />
          
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
                    {profile.first_name?.[0] || t("common.questionMark")}
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-right rtl:text-right ltr:text-left">
                <h1 className="text-xl md:text-2xl font-black text-foreground mb-1">
                  {profile.first_name && profile.last_name 
                    ? `${profile.first_name} ${profile.last_name}` 
                    : t("account.newUser")}
                </h1>
                <p className="text-muted text-sm md:text-base">{user?.email}</p>
              </div>
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
                <h2 className="text-xl font-black text-foreground">{t("account.editProfile")}</h2>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-secondary font-semibold mb-2 text-sm">{t("account.firstName")}</label>
                    <input
                      type="text"
                      value={profile.first_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder={t("account.enterFirstName")}
                    />
                  </div>
                  <div>
                    <label className="block text-secondary font-semibold mb-2 text-sm">{t("account.lastName")}</label>
                    <input
                      type="text"
                      value={profile.last_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder={t("account.enterLastName")}
                    />
                  </div>
                  <div>
                    <label className="block text-secondary font-semibold mb-2 text-sm">{t("account.whatsappNumber")}</label>
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
                  {saving ? t("account.saving") : t("account.saveChanges")}
                </SportButton>
              </div>
            )}

            {/* Avatar Tab */}
            {activeTab === "avatar" && (
              <div className="space-y-8">
                {/* Current Avatar Section */}
                <div className="text-center pb-6 border-b border-border">
                  <p className="text-sm font-semibold text-muted mb-3">{t("account.currentAvatar")}</p>
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
                      <span className="text-3xl font-bold text-primary">{profile.first_name?.[0] || "?"}</span>
                    )}
                  </div>
                </div>

                {/* Avatar Selection using shared component */}
                <div>
                  <h2 className="text-lg font-black text-foreground mb-4">{t("account.chooseNewAvatar")}</h2>
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
                      <p className="text-muted font-semibold">{t("account.noAvatarsAvailable")}</p>
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
                    {saving ? t("account.saving") : t("account.saveAvatar")}
                  </SportButton>
                  {selectedAvatarId && selectedAvatarId !== profile.avatar_id && (
                    <p className="text-center text-sm text-success mt-2 font-semibold">
                      ✓ {t("account.newAvatarSelected")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-foreground">{t("account.stats")}</h2>
                {statsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-muted">{t("account.loadingStats")}</div>
                  </div>
                ) : (
                  <>
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: t("account.matchesPlayed"), value: stats.matchesPlayed.toString(), icon: "⚽", variant: "highlighted" as const },
                        { label: t("account.victories"), value: stats.wins.toString(), icon: "🏆", variant: "success" as const },
                        { label: t("account.drawsLabel"), value: stats.draws.toString(), icon: "🤝", variant: "warning" as const },
                        { label: t("account.lossesLabel"), value: stats.losses.toString(), icon: "😢", variant: "danger" as const },
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

                    {/* Additional Stats */}
                    {stats.matchesPlayed > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <SportCard padding="sm" variant="default">
                          <div className="text-center">
                            <div className="text-lg font-black text-primary">{stats.winRate}%</div>
                            <div className="text-xs text-muted">{t("account.winRate")}</div>
                          </div>
                        </SportCard>
                        <SportCard padding="sm" variant="default">
                          <div className="text-center">
                            <div className="text-lg font-black text-success">{stats.goalsScored}</div>
                            <div className="text-xs text-muted">{t("account.goalsScored")}</div>
                          </div>
                        </SportCard>
                        <SportCard padding="sm" variant="default">
                          <div className="text-center">
                            <div className="text-lg font-black text-danger">{stats.goalsConceded}</div>
                            <div className="text-xs text-muted">{t("account.goalsConceded")}</div>
                          </div>
                        </SportCard>
                        <SportCard padding="sm" variant="default">
                          <div className="text-center">
                            <div className="text-lg font-black text-foreground">{stats.tournamentsParticipated}</div>
                            <div className="text-xs text-muted">{t("account.tournaments")}</div>
                          </div>
                        </SportCard>
                      </div>
                    )}

                    {/* Tournament History */}
                    {stats.tournaments && stats.tournaments.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground">{t("account.tournamentHistory")}</h3>
                        <div className="space-y-3">
                          {stats.tournaments.map((t_item) => (
                            <SportCard key={t_item.tournamentId} padding="base" variant="default">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-bold text-foreground">{t_item.tournamentName}</h4>
                                  <div className="flex items-center gap-3 text-sm text-muted mt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      t_item.tournamentStatus === "finished" ? "bg-success/10 text-success" :
                                      t_item.tournamentStatus === "in_progress" ? "bg-primary/10 text-primary" :
                                      "bg-muted/10 text-muted"
                                    }`}>
                                      {t_item.tournamentStatus === "finished" ? t("account.finished") :
                                       t_item.tournamentStatus === "in_progress" ? t("account.inProgress") : t("account.upcoming")}
                                    </span>
                                    <span>{t_item.matchesPlayed} {t("account.matchesLabel")}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-success font-bold">{t_item.wins}W</span>
                                  <span className="text-muted">/</span>
                                  <span className="text-warning font-bold">{t_item.draws}D</span>
                                  <span className="text-muted">/</span>
                                  <span className="text-danger font-bold">{t_item.losses}L</span>
                                  <span className="text-muted mr-2">|</span>
                                  <span className="text-foreground font-semibold">{t_item.goalsScored}-{t_item.goalsConceded}</span>
                                </div>
                              </div>
                            </SportCard>
                          ))}
                        </div>
                      </div>
                    )}

                    {stats.matchesPlayed === 0 && (
                      <p className="text-muted text-center text-sm">
                        {t("account.noMatchesYet")}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-foreground">{t("account.changePassword")}</h2>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-secondary font-semibold mb-2 text-sm">{t("account.currentPassword")}</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-secondary font-semibold mb-2 text-sm">{t("account.newPassword")}</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-secondary font-semibold mb-2 text-sm">{t("account.confirmNewPassword")}</label>
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
                  {saving ? t("account.changing") : t("account.changePassword")}
                </SportButton>
              </div>
            )}
          </SportCard>
        </div>
      </Container>
    </div>
  );
}

