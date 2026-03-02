import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getTournamentById, getParticipants, getMatches, getTeams, getTeamMembersByTournament } from "@/lib/data";
import { 
  addParticipant, 
  addParticipantsBulk, 
  removeParticipant,
  closeRegistration,
  openRegistration,
  startTournament,
  generateMatchesAction,
  runTeamDrawAction,
  setTournamentType,
  setTournamentFormat,
  updateTeamName,
  updateMatchScore,
  resetToRegistrationOpen,
  resetToRegistrationClosed,
  resetToTypeSelection,
  resetToAfterTeamDraw,
  resetToAfterMatchGeneration
} from "@/app/admin/actions";
import Container from "@/components/Container";
import AdminLayout from "@/components/AdminLayout";
import SportCard from "@/components/ui/SportCard";
import SportButton from "@/components/ui/SportButton";
import SportBadge from "@/components/ui/SportBadge";
import { DeleteButton } from "@/components/DeleteButton";
import ResetToStage from "@/components/ResetToStage";
import { EditTeamNameButton } from "@/components/EditTeamNameButton";
import MatchScoreEditor from "@/components/MatchScoreEditor";
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Trophy,
  UserPlus,
  Play,
  Lock,
  Unlock,
  Trash2,
  Swords,
  Shuffle,
  UsersRound
} from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TournamentDashboard(props: Props) {
  const params = await props.params;
  const tournamentId = params.id;

  // Check admin access
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    redirect("/auth/login");
  }

  // Load tournament data
  const tournament = await getTournamentById(tournamentId);
  if (!tournament) {
    notFound();
  }

  const participants = await getParticipants(tournamentId);
  const matches = await getMatches(tournamentId);
  const teams = await getTeams(tournamentId);
  const teamMembers = await getTeamMembersByTournament(tournamentId);

  // Team tournament detection
  const isTeamTournament = (tournament.players_per_team ?? 1) > 1;
  const isRandomDraw = tournament.team_formation_mode === "random_draw";
  const needsTeamDraw = isTeamTournament && isRandomDraw && teams.length === 0;
  const hasTeams = teams.length > 0;

  // Build team-to-members map
  const teamMembersMap = new Map<string, { participantId: string; participantName: string }[]>();
  for (const tm of teamMembers) {
    if (!teamMembersMap.has(tm.team_id)) {
      teamMembersMap.set(tm.team_id, []);
    }
    const participant = participants.find(p => p.id === tm.participant_id);
    teamMembersMap.get(tm.team_id)!.push({
      participantId: tm.participant_id || "",
      participantName: participant?.name || "غير معروف"
    });
  }

  const statusLabels: Record<string, string> = {
    pending: "قيد الانتظار",
    registration_open: "التسجيل مفتوح",
    registration_closed: "التسجيل مغلق",
    running: "جارية",
    finished: "انتهت",
  };

  const statusVariants: Record<string, "info" | "success" | "warning" | "danger" | "primary"> = {
    pending: "info",
    registration_open: "success",
    registration_closed: "warning",
    running: "primary",
    finished: "danger",
  };

  return (
    <AdminLayout>
      <Container>
        <div className="py-8 md:py-12 space-y-8">
          {/* Back Button */}
          <Link href="/admin/tournaments" className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bold">العودة للبطولات</span>
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black text-primary">
                {tournament.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <SportBadge variant={statusVariants[tournament.status] || "info"}>
                  {statusLabels[tournament.status] || tournament.status}
                </SportBadge>
                {tournament.start_date && (
                  <span className="text-sm text-muted flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(tournament.start_date).toLocaleDateString("ar-SA")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SportCard padding="base" variant="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-black text-foreground">{participants.length}</div>
                  <div className="text-xs text-muted">مشارك</div>
                </div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Swords className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-black text-foreground">{matches.length}</div>
                  <div className="text-xs text-muted">مباراة</div>
                </div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-black text-foreground">
                    {matches.filter(m => m.status === "completed").length}
                  </div>
                  <div className="text-xs text-muted">مباراة منتهية</div>
                </div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="highlighted">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black text-foreground">
                    {matches.filter(m => m.status === "pending" || m.status === "scheduled").length}
                  </div>
                  <div className="text-xs text-muted">مباراة قادمة</div>
                </div>
              </div>
            </SportCard>
          </div>

          {/* Tournament Format Selection - Individual vs Team (can change after registration) */}
          {matches.length === 0 && (
            <SportCard padding="lg" variant="elevated">
              <h2 className="text-xl font-black text-foreground mb-4">👥 صيغة البطولة (فردي / فرق)</h2>
              <p className="text-sm text-muted mb-4">
                الصيغة الحالية: {" "}
                <strong>
                  {isTeamTournament 
                    ? (isRandomDraw ? "فرق (قرعة عشوائية) 2v2" : "فرق (جاهزة) 2v2") 
                    : "فردي 1v1"
                  }
                </strong>
              </p>
              <div className="flex flex-wrap gap-3">
                <form action={setTournamentFormat}>
                  <input type="hidden" name="tournamentId" value={tournamentId} />
                  <input type="hidden" name="format" value="individual" />
                  <SportButton 
                    type="submit" 
                    variant={!isTeamTournament ? "primary" : "outline"} 
                    size="sm"
                  >
                    🧍 فردي (1v1)
                  </SportButton>
                </form>
                <form action={setTournamentFormat}>
                  <input type="hidden" name="tournamentId" value={tournamentId} />
                  <input type="hidden" name="format" value="team_random" />
                  <SportButton 
                    type="submit" 
                    variant={isTeamTournament && isRandomDraw ? "primary" : "outline"} 
                    size="sm"
                  >
                    🎲 فرق بالقرعة (2v2)
                  </SportButton>
                </form>
                <form action={setTournamentFormat}>
                  <input type="hidden" name="tournamentId" value={tournamentId} />
                  <input type="hidden" name="format" value="team_preformed" />
                  <SportButton 
                    type="submit" 
                    variant={isTeamTournament && !isRandomDraw ? "primary" : "outline"} 
                    size="sm"
                  >
                    👥 فرق جاهزة (2v2)
                  </SportButton>
                </form>
              </div>
              {isTeamTournament && isRandomDraw && hasTeams && (
                <p className="text-sm text-success mt-3">✅ تم سحب {teams.length} فرق</p>
              )}
              {isTeamTournament && isRandomDraw && !hasTeams && participants.length >= 4 && (
                <p className="text-sm text-warning mt-3">⚠️ لم يتم سحب الفرق بعد - اضغط على "سحب الفرق" في الأسفل</p>
              )}
            </SportCard>
          )}

          {/* Tournament Type Selection - only show when type not set and no matches */}
          {!tournament.type && matches.length === 0 && (
            <SportCard padding="lg" variant="elevated">
              <h2 className="text-xl font-black text-foreground mb-4">⚙️ اختيار نوع البطولة</h2>
              <p className="text-sm text-muted mb-4">يجب اختيار نوع البطولة قبل إنشاء المباريات</p>
              <div className="flex flex-wrap gap-3">
                <form action={setTournamentType}>
                  <input type="hidden" name="tournamentId" value={tournamentId} />
                  <input type="hidden" name="type" value="league" />
                  <SportButton type="submit" variant="primary" size="sm">
                    🏆 دوري (كل فريق يلعب مع الآخرين)
                  </SportButton>
                </form>
                <form action={setTournamentType}>
                  <input type="hidden" name="tournamentId" value={tournamentId} />
                  <input type="hidden" name="type" value="knockout" />
                  <SportButton type="submit" variant="secondary" size="sm">
                    ⚡ خروج مباشر (إقصائي)
                  </SportButton>
                </form>
              </div>
            </SportCard>
          )}

          {/* Show current type if set */}
          {tournament.type && matches.length === 0 && (
            <SportCard padding="lg" variant="default">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {tournament.type === "league" ? "🏆" : "⚡"}
                  </span>
                  <div>
                    <span className="font-bold text-foreground">
                      نوع البطولة: {tournament.type === "league" ? "دوري" : "خروج مباشر"}
                    </span>
                    {isTeamTournament && (
                      <span className="text-muted text-sm mr-2">
                        • {isRandomDraw ? "قرعة عشوائية" : "فرق جاهزة"} (2v2)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action={setTournamentType}>
                    <input type="hidden" name="tournamentId" value={tournamentId} />
                    <input type="hidden" name="type" value={tournament.type === "league" ? "knockout" : "league"} />
                    <SportButton type="submit" variant="secondary" size="sm">
                      تغيير إلى {tournament.type === "league" ? "خروج مباشر" : "دوري"}
                    </SportButton>
                  </form>
                </div>
              </div>
            </SportCard>
          )}

          {/* Actions */}
          <SportCard padding="lg" variant="elevated">
            <h2 className="text-xl font-black text-foreground mb-4">إجراءات سريعة</h2>
            <div className="flex flex-wrap gap-3">
              {tournament.status === "registration_open" && (
                <form action={closeRegistration}>
                  <input type="hidden" name="tournamentId" value={tournamentId} />
                  <SportButton type="submit" variant="danger" size="sm">
                    <Lock className="w-4 h-4" />
                    إغلاق التسجيل
                  </SportButton>
                </form>
              )}
              {tournament.status === "registration_closed" && (
                <>
                  <form action={openRegistration}>
                    <input type="hidden" name="tournamentId" value={tournamentId} />
                    <SportButton type="submit" variant="secondary" size="sm">
                      <Unlock className="w-4 h-4" />
                      إعادة فتح التسجيل
                    </SportButton>
                  </form>
                  <form action={startTournament}>
                    <input type="hidden" name="tournamentId" value={tournamentId} />
                    <SportButton type="submit" variant="primary" size="sm">
                      <Play className="w-4 h-4" />
                      بدء البطولة
                    </SportButton>
                  </form>
                </>
              )}
              {(tournament.status === "running" || tournament.status === "registration_closed") && matches.length === 0 && (
                <>
                  {/* Team Draw button for random team tournaments */}
                  {isTeamTournament && isRandomDraw && (
                    <form action={runTeamDrawAction}>
                      <input type="hidden" name="tournamentId" value={tournamentId} />
                      <SportButton type="submit" variant={hasTeams ? "secondary" : "success"} size="sm">
                        <Shuffle className="w-4 h-4" />
                        {hasTeams ? "إعادة القرعة" : "سحب الفرق"}
                      </SportButton>
                    </form>
                  )}
                  {/* Generate Matches button - disabled if team tournament needs draw first OR type not set */}
                  <form action={generateMatchesAction}>
                    <input type="hidden" name="tournamentId" value={tournamentId} />
                    <SportButton 
                      type="submit" 
                      variant="success" 
                      size="sm"
                      disabled={needsTeamDraw || !tournament.type}
                    >
                      <Swords className="w-4 h-4" />
                      إنشاء المباريات
                    </SportButton>
                  </form>
                  {needsTeamDraw && (
                    <span className="text-sm text-warning">⚠️ يجب سحب الفرق أولاً</span>
                  )}
                  {!tournament.type && (
                    <span className="text-sm text-warning">⚠️ يجب تحديد نوع البطولة أولاً</span>
                  )}
                </>
              )}
            </div>
          </SportCard>

          {/* Add Participant */}
          <SportCard padding="lg" variant="elevated">
            <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              إضافة مشاركين
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Single Add */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-muted">إضافة مشارك واحد</h3>
                <form action={addParticipant} className="flex gap-2">
                  <input type="hidden" name="tournamentId" value={tournamentId} />
                  <input
                    type="text"
                    name="name"
                    placeholder="اسم المشارك"
                    required
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <SportButton type="submit" variant="primary" size="sm">
                    إضافة
                  </SportButton>
                </form>
              </div>
              {/* Bulk Add */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-muted">إضافة عدة مشاركين (اسم في كل سطر)</h3>
                <form action={addParticipantsBulk} className="space-y-2">
                  <input type="hidden" name="tournamentId" value={tournamentId} />
                  <textarea
                    name="names"
                    rows={4}
                    placeholder="أحمد&#10;محمد&#10;علي"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                  <SportButton type="submit" variant="secondary" size="sm" className="w-full">
                    إضافة الكل
                  </SportButton>
                </form>
              </div>
            </div>
          </SportCard>

          {/* Participants List */}
          <SportCard padding="lg" variant="elevated">
            <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              المشاركون ({participants.length})
            </h2>
            {participants.length === 0 ? (
              <p className="text-muted text-center py-8">لا يوجد مشاركون بعد</p>
            ) : (
              <div className="grid gap-2">
                {participants.map((p, index) => (
                  <div 
                    key={p.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-alt transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="font-bold text-foreground">{p.name}</span>
                    </div>
                    <form action={removeParticipant}>
                      <input type="hidden" name="participantId" value={p.id} />
                      <input type="hidden" name="tournamentId" value={tournamentId} />
                      <DeleteButton
                        confirmMessage="حذف المشارك؟"
                        className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </DeleteButton>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </SportCard>

          {/* Teams Section - only show for team tournaments */}
          {isTeamTournament && (
            <SportCard padding="lg" variant="elevated">
              <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
                <UsersRound className="w-5 h-5 text-accent" />
                الفرق ({teams.length})
                {isRandomDraw && (
                  <SportBadge variant="info">قرعة عشوائية</SportBadge>
                )}
              </h2>
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted">لم يتم سحب الفرق بعد</p>
                  {participants.length >= 4 && (
                    <p className="text-sm text-muted mt-2">
                      استخدم زر "سحب الفرق" أعلاه لإجراء القرعة
                    </p>
                  )}
                  {participants.length < 4 && (
                    <p className="text-sm text-warning mt-2">
                      ⚠️ يجب وجود 4 مشاركين على الأقل لسحب الفرق
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {teams.map((team, index) => {
                    const members = teamMembersMap.get(team.id) || [];
                    return (
                      <div 
                        key={team.id} 
                        className="p-4 rounded-lg bg-surface border border-border"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                            {index + 1}
                          </span>
                          <span className="font-black text-foreground">{team.name || "بدون اسم"}</span>
                          <EditTeamNameButton
                            teamId={team.id}
                            tournamentId={tournamentId}
                            initialName={team.name || ""}
                            onUpdate={updateTeamName}
                            iconOnly
                          />
                        </div>
                        <div className="space-y-1">
                          {members.map((member, idx) => (
                            <div key={member.participantId} className="flex items-center gap-2 text-sm text-muted">
                              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {idx + 1}
                              </span>
                              <span>{member.participantName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SportCard>
          )}

          {/* Matches */}
          {matches.length > 0 && (
            <SportCard padding="lg" variant="elevated">
              <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
                <Swords className="w-5 h-5 text-accent" />
                المباريات ({matches.length})
              </h2>
              <div className="grid gap-3">
                {matches.slice(0, 20).map((match) => (
                  <MatchScoreEditor
                    key={match.id}
                    matchId={match.id}
                    tournamentId={tournamentId}
                    round={match.round ?? 1}
                    homeName={match.home_name}
                    awayName={match.away_name}
                    homeScore={match.home_score}
                    awayScore={match.away_score}
                    status={match.status}
                    onUpdateScore={updateMatchScore}
                  />
                ))}
                {matches.length > 20 && (
                  <p className="text-center text-muted py-2">
                    + {matches.length - 20} مباراة أخرى
                  </p>
                )}
              </div>
            </SportCard>
          )}

          {/* Reset Tournament to Stage */}
          <ResetToStage
            tournamentId={tournamentId}
            status={tournament.status}
            hasType={!!tournament.type}
            hasTeams={hasTeams}
            hasMatches={matches.length > 0}
            isTeamBased={isTeamTournament}
            onResetToRegistrationOpen={resetToRegistrationOpen}
            onResetToRegistrationClosed={resetToRegistrationClosed}
            onResetToTypeSelection={resetToTypeSelection}
            onResetToAfterTeamDraw={resetToAfterTeamDraw}
            onResetToAfterMatchGeneration={resetToAfterMatchGeneration}
          />
        </div>
      </Container>
    </AdminLayout>
  );
}
