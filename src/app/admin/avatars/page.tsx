import { redirect } from "next/navigation";
import Container from "@/components/Container";
import AdminLayout from "@/components/AdminLayout";
import SportCard from "@/components/ui/SportCard";
import { Image as ImageIcon, Settings } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAvatars } from "@/lib/data";
import type { Avatar } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AvatarsPage() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    redirect("/");
  }

  const avatars = await getAvatars();

  const grouped: Record<string, Avatar[]> = avatars.reduce((acc, avatar) => {
    const category = avatar.category || "player";
    if (!acc[category]) acc[category] = [];
    acc[category].push(avatar);
    return acc;
  }, {} as Record<string, Avatar[]>);

  return (
    <AdminLayout>
      <Container>
        <div className="py-12 md:py-16 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/bg border border-accent/40">
              <Settings className="w-4 h-4 text-accent" />
              <span className="text-sm font-extrabold text-accent uppercase tracking-[0.18em]">
                إدارة الأفتارات
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary">
              مكتبة الصور الرمزية
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              استعرض صور اللاعبين المستخدمة في التسجيل والملفات الشخصية.
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SportCard padding="base" variant="default">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-extrabold text-muted uppercase tracking-widest">
                    إجمالي الصور
                  </div>
                  <div className="text-3xl font-black text-foreground mt-1">
                    {avatars.length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </SportCard>
            {Object.entries(grouped).map(([category, list]) => (
              <SportCard key={category} padding="base" variant="elevated">
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold text-muted uppercase tracking-widest">
                    {category === "legend" ? "أساطير" : "لاعبون"}
                  </div>
                  <div className="text-2xl font-black text-foreground">
                    {list.length}
                  </div>
                </div>
              </SportCard>
            ))}
          </div>

          {/* Avatars Grid */}
          {avatars.length === 0 ? (
            <SportCard padding="lg" variant="elevated" className="text-center">
              <p className="text-lg text-muted">لا توجد صور رمزية بعد.</p>
            </SportCard>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([category, list]) => (
                <div key={category} className="space-y-3">
                  <h2 className="text-sm font-extrabold text-muted uppercase tracking-[0.2em] text-right">
                    {category === "legend" ? "فئة الأساطير" : "فئة اللاعبين"}
                  </h2>
                  <SportCard padding="lg" variant="default" className="bg-white/80">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {list.map((avatar) => (
                        <div
                          key={avatar.id}
                          className="group flex flex-col items-center p-3 rounded-xl bg-surface-2 hover:bg-surface border border-border/60 hover:border-primary/40 transition-all duration-200"
                        >
                          <div className="relative w-20 h-20 mb-2 rounded-xl overflow-hidden bg-white border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={avatar.image_url}
                              alt={avatar.display_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.id}`;
                              }}
                            />
                          </div>
                          <div className="w-full text-center">
                            <p className="text-xs font-bold text-foreground truncate">
                              {avatar.name}
                            </p>
                            <p className="text-[10px] text-muted truncate">
                              {avatar.display_name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SportCard>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </AdminLayout>
  );
}
