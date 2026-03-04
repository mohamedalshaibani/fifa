"use client";

import Link from "next/link";
import Container from "@/components/Container";
import AdminLayout from "@/components/AdminLayout";
import SportCard from "@/components/ui/SportCard";
import { Users, Trophy, Image, Settings, Zap } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function AdminDashboardContent() {
  const { t } = useLanguage();

  const sections = [
    {
      icon: Trophy,
      label: t("admin.sections.tournaments"),
      description: t("admin.sections.tournamentsDesc"),
      href: "/admin/tournaments",
    },
    {
      icon: Users,
      label: t("admin.sections.users"),
      description: t("admin.sections.usersDesc"),
      href: "/admin/users",
    },
    {
      icon: Image,
      label: t("admin.sections.avatars"),
      description: t("admin.sections.avatarsDesc"),
      href: "/admin/avatars",
    },
  ];

  return (
    <AdminLayout>
      <Container>
        <div className="py-12 md:py-16">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30">
              <Settings className="w-4 h-4 text-secondary" />
              <span className="text-sm font-extrabold text-secondary uppercase">{t("admin.title")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary">
              {t("admin.dashboard")}
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              {t("admin.manageTournamentsAndUsers")}
            </p>
          </div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group"
                >
                  <SportCard
                    padding="base"
                    hoverable
                    className="h-full flex flex-col"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <Zap className="w-5 h-5 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors">
                          {section.label}
                        </h3>
                        <p className="text-sm text-muted">{section.description}</p>
                      </div>
                    </div>
                  </SportCard>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </AdminLayout>
  );
}
