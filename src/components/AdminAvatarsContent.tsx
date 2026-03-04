"use client";

import Container from "@/components/Container";
import AdminLayout from "@/components/AdminLayout";
import SportCard from "@/components/ui/SportCard";
import { Image as ImageIcon, Settings } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import AvatarManagementClient from "@/app/admin/avatars/AvatarManagementClient";
import type { Avatar } from "@/lib/types";

interface AdminAvatarsContentProps {
  avatars: Avatar[];
  grouped: Record<string, Avatar[]>;
}

export default function AdminAvatarsContent({ avatars, grouped }: AdminAvatarsContentProps) {
  const { t } = useLanguage();

  return (
    <AdminLayout>
      <Container>
        <div className="py-12 md:py-16 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/bg border border-accent/40">
              <Settings className="w-4 h-4 text-accent" />
              <span className="text-sm font-extrabold text-accent uppercase tracking-[0.18em]">
                {t("admin.avatars.title")}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary">
              {t("admin.avatars.library")}
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              {t("admin.avatars.subtitle")}
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SportCard padding="base" variant="default">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-extrabold text-muted uppercase tracking-widest">
                    {t("admin.avatars.totalImages")}
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
                    {category === "legend" ? t("admin.avatars.legendsCategory") : t("admin.avatars.playersCategory")}
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
