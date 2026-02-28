import Link from "next/link";
import { getPublicTournaments } from "@/lib/data";
import Container from "@/components/Container";
import SportPageLayout from "@/components/SportPageLayout";
import SportBadge from "@/components/ui/SportBadge";
import SportButton from "@/components/ui/SportButton";
import SportCard from "@/components/ui/SportCard";
import { Users, Trophy, Flame, Filter } from "lucide-react";

export default async function PublicTournamentsPage() {
  const tournaments = await getPublicTournaments();

  return (
    <SportPageLayout>
      <Container>
        {/* Page Header */}
        <div className="py-12 md:py-16 lg:py-20">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30">
              <Filter className="w-4 h-4 text-secondary" />
              <span className="text-sm font-extrabold text-secondary uppercase">كل البطولات</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-primary heading-tight">
              اكتشف البطولات الحية
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              اختر بطولتك المفضلة وابدأ المنافسة الآن
            </p>
          </div>

          {tournaments.length === 0 ? (
            /* Empty State */
            <div className="max-w-2xl mx-auto pb-12">
              <SportCard padding="lg" variant="elevated" className="text-center">
                <div className="space-y-4">
                  <div className="text-6xl">⚽</div>
                  <h3 className="text-xl font-extrabold text-foreground">
                    لا توجد بطولات متاحة حالياً
                  </h3>
                  <p className="text-base text-muted">
                    ترقب البطولات الجديدة قريباً!
                  </p>
                </div>
              </SportCard>
            </div>
          ) : (
            /* Tournaments Grid */
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-16">
              {tournaments.map((tournament) => {
                const statusMap: Record<string, { variant: any; label: string; icon: string }> = {
                  running: { variant: "primary", label: "🔴 جارية الآن", icon: "🔥" },
                  registration_open: { variant: "warning", label: "🟡 التسجيل مفتوح", icon: "⚡" },
                  registration_closed: { variant: "info", label: "🟠 مغلقة", icon: "🔒" },
                  pending: { variant: "info", label: "🟤 قادمة", icon: "📅" },
                  finished: { variant: "info", label: "⚪ انتهت", icon: "✅" }
                };
                
                const statusInfo = statusMap[tournament.status as string] || statusMap.pending;

                return (
                  <SportCard
                    key={tournament.id}
                    padding="base"
                    hoverable
                    variant={tournament.status === "running" ? "highlighted" : "default"}
                    className="h-full flex flex-col"
                  >
                    <div className="space-y-4 flex-1 flex flex-col">
                      {/* Header with Title and Status */}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-extrabold text-foreground flex-1 group-hover:text-primary">
                          {tournament.name}
                        </h3>
                      </div>

                      {/* Status Badge */}
                      <SportBadge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </SportBadge>

                      {/* Details Grid */}
                        <div className="space-y-3 py-2">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                          <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-muted">النوع</span>
                            <span className="text-sm font-bold text-primary">
                              {tournament.type === "league" ? "🏆 دوري" : "⚡ خروج مباشر"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/10 border border-secondary/20">
                          <Users className="w-4 h-4 text-secondary flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-muted">التنسيق</span>
                            <span className="text-sm font-bold text-secondary">
                              {tournament.players_per_team === 1 ? "1v1" : `${tournament.players_per_team}v${tournament.players_per_team}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 mt-auto">
                        <Link href={`/t/${tournament.slug}`} className="block">
                          {tournament.status === "registration_open" ? (
                            <SportButton variant="primary" size="sm" className="w-full font-bold">
                              <Flame className="w-4 h-4" />
                              سجل الآن
                            </SportButton>
                          ) : tournament.status === "running" ? (
                            <SportButton variant="secondary" size="sm" className="w-full font-bold">
                              <Trophy className="w-4 h-4" />
                              شاهد الآن
                            </SportButton>
                          ) : (
                            <SportButton variant="ghost" size="sm" className="w-full font-bold">
                              <Trophy className="w-4 h-4" />
                              عرض التفاصيل
                            </SportButton>
                          )}
                        </Link>
                      </div>
                    </div>
                  </SportCard>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </SportPageLayout>
  );
}