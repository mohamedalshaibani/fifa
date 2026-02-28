import Link from "next/link";
import Container from "@/components/Container";
import SportPageLayout from "@/components/SportPageLayout";
import SportButton from "@/components/ui/SportButton";
import SportCard from "@/components/ui/SportCard";
import SportBadge from "@/components/ui/SportBadge";
import { getAllTournaments, getParticipants, getMatches } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { Users, Trophy, Flame, Target, Award, Zap, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tournaments = await getAllTournaments();
  const currentUser = await getCurrentUser();
  
  // Get participant and match counts for all tournaments
  const tournamentData = await Promise.all(
    tournaments.map(async (tournament) => {
      const participants = await getParticipants(tournament.id);
      const isUserRegistered = currentUser 
        ? participants.some(p => p.user_id === currentUser.id)
        : false;
      
      return {
        tournament,
        participantCount: participants.length,
        matches: await getMatches(tournament.id),
        isUserRegistered,
      };
    })
  );

  // Filter active/upcoming tournaments (not finished)
  const activeTournaments = tournamentData.filter(
    (t) => t.tournament.status !== "finished"
  );

  // Sort by priority: running > registration_open > registration_closed > pending
  const statusPriority: Record<string, number> = {
    running: 1,
    registration_open: 2,
    registration_closed: 3,
    pending: 4,
  };
  
  activeTournaments.sort((a, b) => {
    const aPriority = statusPriority[a.tournament.status] ?? 99;
    const bPriority = statusPriority[b.tournament.status] ?? 99;
    return aPriority - bPriority;
  });

  return (
    <SportPageLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 md:pt-20 lg:pt-24 pb-12">
        <Container className="relative z-10">
          {/* Hero Header */}
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary leading-tight tracking-tight heading-tight">
              <div>اختبر مهاراتك</div>
              <div className="mt-4 text-secondary">
                في أقوى البطولات
              </div>
            </h1>
            
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto font-medium">
              انضم للبطولات الحية، واجه أفضل اللاعبين، وحقق البطولات
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/tournaments">
                <SportButton variant="primary" size="lg" className="group">
                  <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  تصفح البطولات
                </SportButton>
              </Link>
            </div>
          </div>

          {/* Tournaments Grid */}
          {activeTournaments.length === 0 ? (
            /* Empty State */
            <div className="max-w-2xl mx-auto pb-12">
              <SportCard padding="lg" variant="elevated" className="text-center">
                <div className="space-y-4">
                  <div className="text-6xl">⚽</div>
                  <h3 className="text-xl font-extrabold text-foreground">
                    لا توجد بطولات حالياً
                  </h3>
                  <p className="text-base text-muted">
                    قريباً بطولات جديدة ومثيرة!
                  </p>
                </div>
              </SportCard>
            </div>
          ) : (
            /* Tournament Cards Grid */
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-16">
              {activeTournaments.map(({ tournament, participantCount, matches, isUserRegistered }) => {
                const completedMatches = matches.filter((m) => m.status === "completed").length;
                const isRegistrationOpen = tournament.status === "registration_open";
                const isRunning = tournament.status === "running";

                return (
                  <Link
                    key={tournament.id}
                    href={`/t/${tournament.slug}`}
                    className="group"
                  >
                    <SportCard
                      padding="base"
                      hoverable
                      variant={isRunning ? "highlighted" : "default"}
                      className={`h-full flex flex-col relative ${isRegistrationOpen ? "animate-attention-shake" : ""}`}
                    >
                      <div className="space-y-4 flex-1 flex flex-col">
                        {/* Top badges bar */}
                        <div className="flex items-center justify-between gap-2">
                          <SportBadge 
                            variant={isRunning ? "primary" : isRegistrationOpen ? "warning" : "info"}
                            icon={isRunning ? <Zap className="w-3 h-3" /> : <Trophy className="w-3 h-3" />}
                          >
                            {tournament.status === "running" ? "🔴 جارية الآن" : 
                             tournament.status === "registration_open" ? "🟡 التسجيل مفتوح" : 
                             tournament.status === "registration_closed" ? "🟠 مغلقة" : "🟤 قادمة"}
                          </SportBadge>
                        </div>

                        {/* Tournament Name */}
                        <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors">
                          {tournament.name}
                        </h3>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Participants */}
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                            <Users className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs text-muted">مشاركون</span>
                              <span className="text-lg font-bold text-primary">{participantCount}</span>
                            </div>
                          </div>

                          {/* Format */}
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/10 border border-secondary/20">
                            <Trophy className="w-4 h-4 text-secondary flex-shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs text-muted">النوع</span>
                              <span className="text-lg font-bold text-secondary">
                                {tournament.players_per_team === 1 ? "1v1" : "2v2"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Tournament Type Badge */}
                        <div className="flex items-center gap-2">
                          <SportBadge variant="info" icon={tournament.type === "league" ? "🏆" : "⚡"}>
                            {tournament.type === "league" ? "دوري" : "خروج مباشر"}
                          </SportBadge>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-2 mt-auto">
                          {isUserRegistered ? (
                            // User is already registered
                            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-green-500/20 border border-green-500/40 text-green-500 font-bold text-sm">
                              <CheckCircle className="w-4 h-4" />
                              أنت مسجل في البطولة ✅
                            </div>
                          ) : isRegistrationOpen ? (
                            <SportButton variant="primary" size="sm" className="w-full font-bold">
                              <Zap className="w-4 h-4" />
                              سجل الآن
                            </SportButton>
                          ) : isRunning ? (
                            <SportButton
                              variant="secondary"
                              size="sm"
                              className="w-full font-bold"
                            >
                              <Flame className="w-4 h-4" />
                              شاهد الآن
                            </SportButton>
                          ) : (
                            <SportButton
                              variant="ghost"
                              size="sm"
                              className="w-full font-bold"
                            >
                              <Award className="w-4 h-4" />
                              عرض التفاصيل
                            </SportButton>
                          )}
                        </div>
                      </div>

                      {/* Closing Soon Badge */}
                      {isRegistrationOpen && participantCount >= 12 && (
                        <div className="absolute top-2 right-2 z-20">
                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-secondary to-danger text-white text-xs font-extrabold shadow-lg animate-pulse">
                            🔥 قرب الإغلاق
                          </div>
                        </div>
                      )}
                    </SportCard>
                  </Link>
                );
              })}
            </div>
          )}

          {/* View All Link */}
          {activeTournaments.length > 0 && (
            <div className="text-center pb-12">
              <Link href="/tournaments">
                <SportButton variant="secondary" size="lg" className="font-bold">
                  <Trophy className="w-5 h-5" />
                  تصفح جميع البطولات
                </SportButton>
              </Link>
            </div>
          )}
        </Container>
      </section>
    </SportPageLayout>
  );
}