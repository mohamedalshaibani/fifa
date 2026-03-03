import Link from "next/link";
import Container from "@/components/Container";
import SportPageLayout from "@/components/SportPageLayout";
import SportButton from "@/components/ui/SportButton";
import SportCard from "@/components/ui/SportCard";
import SportBadge from "@/components/ui/SportBadge";
import { getAllTournaments, getParticipants, getMatches, computeUserStatsFromMatches, getUserTournamentActivities } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { Users, Trophy, Flame, Target, Award, Zap, CheckCircle, Calendar, BarChart3, Swords, TrendingUp, Minus, X as XIcon, CircleDot } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tournaments = await getAllTournaments();
  const currentUser = await getCurrentUser();
  
  // Fetch user stats and activities if logged in
  const userStats = currentUser ? await computeUserStatsFromMatches(currentUser.id) : null;
  const userActivities = currentUser ? await getUserTournamentActivities(currentUser.id) : [];
  
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

  // Separate active vs finished tournaments
  const activeTournaments = tournamentData.filter(
    (t) => t.tournament.status !== "finished"
  );
  
  const finishedTournaments = tournamentData.filter(
    (t) => t.tournament.status === "finished"
  );

  // Sort active by priority: running > registration_open > registration_closed > pending
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

  // Sort finished by most recent first
  finishedTournaments.sort((a, b) => {
    const dateA = new Date(a.tournament.created_at).getTime();
    const dateB = new Date(b.tournament.created_at).getTime();
    return dateB - dateA;
  });

  const hasTournaments = activeTournaments.length > 0 || finishedTournaments.length > 0;
  const hasPlayedMatches = userStats && userStats.matchesPlayed > 0;
  const hasParticipations = userActivities.length > 0;

  return (
    <SportPageLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 md:pt-20 lg:pt-24 pb-12">
        <Container className="relative z-10">
          {/* Personalized Greeting for Logged-in Users */}
          {currentUser ? (
            <div className="text-center space-y-4 mb-10">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-tight tracking-tight">
                أهلاً {currentUser.displayName} 👋
              </h1>
              <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto font-medium">
                جاهز للبطولات؟ خلّ نرجّع الحماس! 🔥
              </p>
            </div>
          ) : (
            /* Default Hero for Non-Logged-in Users */
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
          )}

          {/* User Stats Section (Only for logged-in users) */}
          {currentUser && (
            <div className="mb-12">
              {hasPlayedMatches && (
                /* Section Title */
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">إحصائياتي</h2>
                    <p className="text-sm text-muted">ملخص أدائك في جميع البطولات</p>
                  </div>
                </div>
              )}
              {hasPlayedMatches ? (
                /* Stats Cards */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                  {/* Matches Played */}
                  <SportCard padding="sm" variant="default" className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-1">
                        <Swords className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-2xl font-black text-foreground">{userStats.matchesPlayed}</span>
                      <span className="text-xs text-muted font-medium">مباريات</span>
                    </div>
                  </SportCard>

                  {/* Wins */}
                  <SportCard padding="sm" variant="default" className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center mb-1">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <span className="text-2xl font-black text-green-500">{userStats.wins}</span>
                      <span className="text-xs text-muted font-medium">فوز</span>
                    </div>
                  </SportCard>

                  {/* Draws */}
                  <SportCard padding="sm" variant="default" className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center mb-1">
                        <Minus className="w-5 h-5 text-yellow-500" />
                      </div>
                      <span className="text-2xl font-black text-yellow-600">{userStats.draws}</span>
                      <span className="text-xs text-muted font-medium">تعادل</span>
                    </div>
                  </SportCard>

                  {/* Losses */}
                  <SportCard padding="sm" variant="default" className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center mb-1">
                        <XIcon className="w-5 h-5 text-red-500" />
                      </div>
                      <span className="text-2xl font-black text-red-500">{userStats.losses}</span>
                      <span className="text-xs text-muted font-medium">خسارة</span>
                    </div>
                  </SportCard>

                  {/* Win Rate */}
                  <SportCard padding="sm" variant="default" className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-1">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-2xl font-black text-primary">{userStats.winRate}%</span>
                      <span className="text-xs text-muted font-medium">نسبة الفوز</span>
                    </div>
                  </SportCard>

                  {/* Goals */}
                  <SportCard padding="sm" variant="default" className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center mb-1">
                        <CircleDot className="w-5 h-5 text-secondary" />
                      </div>
                      <span className="text-2xl font-black text-secondary">{userStats.goalsScored}</span>
                      <span className="text-xs text-muted font-medium">أهداف</span>
                    </div>
                  </SportCard>
                </div>
              ) : hasParticipations ? (
                /* User is registered but no matches played yet */
                <SportCard padding="base" variant="default" className="text-center mb-8">
                  <div className="py-4 space-y-3">
                    <div className="text-4xl">⏳</div>
                    <p className="text-foreground font-bold">بانتظار المباريات</p>
                    <p className="text-sm text-muted">أنت مسجل في البطولات! إحصائياتك ستظهر بعد أول مباراة.</p>
                  </div>
                </SportCard>
              ) : (
                /* No Matches and No Participations */
                <SportCard padding="base" variant="default" className="text-center mb-8">
                  <div className="py-4 space-y-3">
                    <div className="text-4xl">⚽</div>
                    <p className="text-foreground font-bold">لم تلعب أي مباريات بعد</p>
                    <p className="text-sm text-muted">شارك في البطولات لتظهر إحصائياتك!</p>
                  </div>
                </SportCard>
              )}

              {/* My Activity Section */}
              {userActivities.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">نشاطي في البطولات</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {userActivities.slice(0, 5).map((activity) => (
                      <Link key={activity.tournamentId} href={`/t/${activity.tournamentSlug}`}>
                        <SportCard padding="sm" hoverable variant="default" className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          {/* Tournament Name & Status */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Trophy className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-foreground truncate">{activity.tournamentName}</h3>
                              {activity.teamName && (
                                <p className="text-xs text-muted truncate">فريقي: {activity.teamName}</p>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <SportBadge 
                              variant={activity.status === "finished" ? "success" : activity.status === "running" ? "primary" : "warning"}
                            >
                              {activity.status === "finished" ? "منتهية" : 
                               activity.status === "running" ? "جارية" : 
                               "التسجيل"}
                            </SportBadge>

                            {/* W/D/L Summary */}
                            {(activity.wins + activity.draws + activity.losses) > 0 && (
                              <div className="flex items-center gap-2 text-xs font-bold">
                                <span className="text-green-500">{activity.wins}ف</span>
                                <span className="text-muted">-</span>
                                <span className="text-yellow-600">{activity.draws}ت</span>
                                <span className="text-muted">-</span>
                                <span className="text-red-500">{activity.losses}خ</span>
                              </div>
                            )}
                          </div>
                        </SportCard>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* No Tournaments at all */}
          {!hasTournaments && (
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
          )}

          {/* Active/Current Tournaments Section */}
          {hasTournaments && (
            <div className="space-y-12 pb-16">
              {/* Active Tournaments */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">البطولات الحالية</h2>
                    <p className="text-sm text-muted">بطولات جارية أو مفتوحة للتسجيل</p>
                  </div>
                </div>

                {activeTournaments.length === 0 ? (
                  <SportCard padding="base" variant="default" className="text-center">
                    <div className="py-6 space-y-2">
                      <div className="text-4xl">🎯</div>
                      <p className="text-muted font-medium">لا توجد بطولات حالية</p>
                      <p className="text-sm text-muted">ترقب البطولات القادمة!</p>
                    </div>
                  </SportCard>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeTournaments.map(({ tournament, participantCount, matches, isUserRegistered }) => {
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
              </div>

              {/* Finished Tournaments */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">البطولات المنتهية</h2>
                    <p className="text-sm text-muted">استعرض نتائج البطولات السابقة</p>
                  </div>
                </div>

                {finishedTournaments.length === 0 ? (
                  <SportCard padding="base" variant="default" className="text-center">
                    <div className="py-6 space-y-2">
                      <div className="text-4xl">📋</div>
                      <p className="text-muted font-medium">لا توجد بطولات منتهية بعد</p>
                    </div>
                  </SportCard>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {finishedTournaments.map(({ tournament, participantCount, matches }) => {
                      const completedMatches = matches.filter((m) => m.status === "completed").length;
                      const totalGoals = matches.reduce((sum, m) => {
                        return sum + (m.home_score ?? 0) + (m.away_score ?? 0);
                      }, 0);

                      return (
                        <Link
                          key={tournament.id}
                          href={`/t/${tournament.slug}`}
                          className="group"
                        >
                          <SportCard
                            padding="base"
                            hoverable
                            variant="default"
                            className="h-full flex flex-col"
                          >
                            <div className="space-y-4 flex-1 flex flex-col">
                              {/* Finished Badge */}
                              <div className="flex items-center justify-between gap-2">
                                <SportBadge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
                                  ✅ منتهية
                                </SportBadge>
                                <SportBadge variant="info" icon={tournament.type === "league" ? "🏆" : "⚡"}>
                                  {tournament.type === "league" ? "دوري" : "خروج مباشر"}
                                </SportBadge>
                              </div>

                              {/* Tournament Name */}
                              <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors">
                                {tournament.name}
                              </h3>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-3 gap-2">
                                {/* Participants */}
                                <div className="flex flex-col items-center px-2 py-2 rounded-lg bg-surface-2 border border-border">
                                  <Users className="w-4 h-4 text-muted mb-1" />
                                  <span className="text-sm font-bold text-foreground">{participantCount}</span>
                                  <span className="text-xs text-muted">لاعب</span>
                                </div>

                                {/* Matches */}
                                <div className="flex flex-col items-center px-2 py-2 rounded-lg bg-surface-2 border border-border">
                                  <Calendar className="w-4 h-4 text-muted mb-1" />
                                  <span className="text-sm font-bold text-foreground">{completedMatches}</span>
                                  <span className="text-xs text-muted">مباراة</span>
                                </div>

                                {/* Goals */}
                                <div className="flex flex-col items-center px-2 py-2 rounded-lg bg-surface-2 border border-border">
                                  <Target className="w-4 h-4 text-muted mb-1" />
                                  <span className="text-sm font-bold text-foreground">{totalGoals}</span>
                                  <span className="text-xs text-muted">هدف</span>
                                </div>
                              </div>

                              {/* CTA Button */}
                              <div className="pt-2 mt-auto">
                                <SportButton
                                  variant="ghost"
                                  size="sm"
                                  className="w-full font-bold"
                                >
                                  <BarChart3 className="w-4 h-4" />
                                  عرض النتائج
                                </SportButton>
                              </div>
                            </div>
                          </SportCard>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* View All Link */}
          {hasTournaments && (
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
