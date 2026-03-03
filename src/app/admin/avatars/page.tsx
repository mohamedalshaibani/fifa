import { redirect } from "next/navigation";
import Container from "@/components/Container";
import AdminLayout from "@/components/AdminLayout";
import SportCard from "@/components/ui/SportCard";
import { Image as ImageIcon, Settings } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAvatars } from "@/lib/data";
import type { Avatar } from "@/lib/types";
import AvatarManagementClient from "./AvatarManagementClient";

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
              أضف وعدّل واحذف صور اللاعبين المستخدمة في التسجيل والملفات الشخصية.
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

          {/* Client-side Management UI */}
          <AvatarManagementClient avatars={avatars} grouped={grouped} />
        </div>
      </Container>
    </AdminLayout>
  );
}
