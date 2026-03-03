import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Container from "@/components/Container";
import AdminLayout from "@/components/AdminLayout";
import Link from "next/link";
import SportCard from "@/components/ui/SportCard";
import SportBadge from "@/components/ui/SportBadge";
import { Users, Trophy, Image, Settings, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { isAdmin, userId } = await requireAdmin();
  if (!isAdmin) {
    redirect(userId ? "/account" : "/auth/login");
  }

  const sections = [
    {
      icon: Trophy,
      label: "البطولات",
      description: "إنشاء وإدارة البطولات",
      href: "/admin/tournaments",
    },
    {
      icon: Users,
      label: "المستخدمون",
      description: "إدارة الحسابات والصلاحيات",
      href: "/admin/users",
    },
    {
      icon: Image,
      label: "الأفتارات",
      description: "رفع وتعديل الصور",
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
              <span className="text-sm font-extrabold text-secondary uppercase">الإدارة</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary">
              لوحة التحكم
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              إدارة البطولات والمستخدمين والنظام
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
