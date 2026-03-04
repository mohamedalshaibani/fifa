"use client";

import Link from "next/link";
import Container from "@/components/Container";
import AdminLayout from "@/components/AdminLayout";
import SportCard from "@/components/ui/SportCard";
import SportButton from "@/components/ui/SportButton";
import SportBadge from "@/components/ui/SportBadge";
import { DeleteButton } from "@/components/DeleteButton";
import ResetToStage from "@/components/ResetToStage";
import { EditTeamNameButton } from "@/components/EditTeamNameButton";
import MatchScoreEditor from "@/components/MatchScoreEditor";
import BackLink from "@/components/BackLink";
import { useLanguage } from "@/lib/i18n";
import { 
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
import type { Tournament, Participant, Match, Team, TeamMember } from "@/lib/types";

// Extended Match type with computed names
type MatchWithNames = Match & { home_name: string | null; away_name: string | null };

interface AdminTournamentDashContentProps {
  tournament: Tournament;
  participants: Participant[];
  matches: MatchWithNames[];
  teams: Team[];
  teamMembers: TeamMember[];
  // Server actions passed as props
  addParticipant: (formData: FormData) => Promise<void>;
  addParticipantsBulk: (formData: FormData) => Promise<void>;
  removeParticipant: (formData: FormData) => Promise<void>;
  closeRegistration: (formData: FormData) => Promise<void>;
  openRegistration: (formData: FormData) => Promise<void>;
  startTournament: (formData: FormData) => Promise<void>;
  generateMatchesAction: (formData: FormData) => Promise<void>;
  runTeamDrawAction: (formData: FormData) => Promise<void>;
  setTournamentType: (formData: FormData) => Promise<void>;
  setTournamentFormat: (formData: FormData) => Promise<void>;
  updateTeamName: (formData: FormData) => Promise<void>;
  updateMatchScore: (formData: FormData) => Promise<void>;
  resetToRegistrationOpen: (formData: FormData) => Promise<void>;
  resetToRegistrationClosed: (formData: FormData) => Promise<void>;
  resetToTypeSelection: (formData: FormData) => Promise<void>;
  resetToAfterTeamDraw: (formData: FormData) => Promise<void>;
  resetToAfterMatchGeneration: (formData: FormData) => Promise<void>;
}

export default function AdminTournamentDashContent({
  tournament,
  participants,
  matches,
  teams,
  teamMembers,
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
  resetToAfterMatchGeneration,
}: AdminTournamentDashContentProps) {
  const { t, language } = useLanguage();
  const tournamentId = tournament.id;

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
      participantName: participant?.name || (language === "ar" ? "غير معروف" : "Unknown")
    });
  }

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: t("admin.status.pending"),
      registration_open: t("admin.status.registrationOpen"),
      registration_closed: t("admin.status.registrationClosed"),
      running: t("admin.status.running"),
      finished: t("admin.status.finished"),
    };
    return statusMap[status] || status;
  };

  const statusVariants: Record<string, "info" | "success" | "warning" | "danger" | "primary"> = {
    pending: "info",
    registration_open: "success",
    registration_closed: "warning",
    running: "primary",
    finished: "danger",
  };

  const getCurrentFormat = (): string => {
    if (isTeamTournament) {
      return isRandomDraw 
        ? t("admin.tournamentDash.teamsRandomDraw") 
        : t("admin.tournamentDash.teamsPreformed");
    }
    return t("admin.tournamentDash.individual1v1");
  };

  return (
    <AdminLayout>
      <Container>
        <div className="py-8 md:py-12 space-y-8">
          {/* Back Button */}
          <BackLink href="/admin/tournaments" text={t("admin.backToTournaments")} />

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black text-primary">
                {tournament.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <SportBadge variant={statusVariants[tournament.status] || "info"}>
                  {getStatusLabel(tournament.status)}
                </SportBadge>
                {tournament.start_date && (
                  <span className="text-sm text-muted flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(tournament.start_date).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
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
                  <div className="text-xs text-muted">{t("admin.tournamentDash.participant")}</div>
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
                  <div className="text-xs text-muted">{t("admin.tournamentDash.match")}</div>
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
                  <div className="text-xs text-muted">{t("admin.tournamentDash.completedMatch")}</div>
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
                  <div className="text-xs text-muted">{t("admin.tournamentDash.upcomingMatch")}</div>
                </div>
              </div>
            </SportCard>
          </div>

          {/* Tournament Format Selection */}
          {matches.length === 0 && (
            <SportCard padding="lg" variant="elevated">
              <h2 className="text-xl font-black text-foreground mb-4">{t("admin.tournamentDash.tournamentFormat")}</h2>
              <p className="text-sm text-muted mb-4">
                {t("admin.tournamentDash.currentFormat")} <strong>{getCurrentFormat()}</strong>
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
                    {t("admin.tournamentDash.formatIndividual")}
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
                    {t("admin.tournamentDash.formatTeamsRandom")}
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
                    {t("admin.tournamentDash.formatTeamsPreformed")}
                  </SportButton>
                </form>
              </div>
              {isTeamTournament && isRandomDraw && hasTeams && (
                <p className="text-sm text-success mt-3">{t("admin.tournamentDash.teamsDrawn")} {teams.length} {t("admin.tournamentDash.teamsCount")}</p>
              )}
              {isTeamTournament && isRandomDraw && !hasTeams && participants.length >= 4 && (
                <p className="text-sm text-warning mt-3">{t("admin.tournamentDash.teamsNotDrawnWarning")}</p>
              )}
            </SportCard>
          )}

          {/* Tournament Type Selection */}
          {!tournament.type && matches.length === 0 && (
            <SportCard padding="lg" variant="elevated">
              <h2 className="text-xl font-black text-foreground mb-4">{t("admin.tournamentDash.selectType")}</h2>
              <p className="text-sm text-muted mb-4">{t("admin.tournamentDash.selectTypeDesc")}</p>
              <div className="flex flex-wrap gap-3">
                <form action={setTournamentType}>
                  <input type="hidden" name="tournamentId" value={tournamentId} />
                  <input type="hidden" name="type" value="league" />
                  <SportButton type="submit" variant="primary" size="sm">
                    {t("admin.tournamentDash.leagueFull")}
                  </SportButton>
                </form>
                <form action={setTournamentType}>
                  <input type="hidden" name="tournamentId" value={tournamentId} />
                  <input type="hidden" name="type" value="knockout" />
                  <SportButton type="submit" variant="secondary" size="sm">
                    {t("admin.tournamentDash.knockoutFull")}
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
                      {t("admin.tournamentDash.tournamentType")} {tournament.type === "league" ? t("admin.createForm.league") : t("admin.createForm.knockout")}
                    </span>
                    {isTeamTournament && (
                      <span className="text-muted text-sm mr-2">
                        • {isRandomDraw ? t("admin.createForm.randomDraw") : t("admin.createForm.preformed")} (2v2)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action={setTournamentType}>
                    <input type="hidden" name="tournamentId" value={tournamentId} />
                    <input type="hidden" name="type" value={tournament.type === "league" ? "knockout" : "league"} />
                    <SportButton type="submit" variant="secondary" size="sm">
                      {tournament.type === "league" ? t("admin.tournamentDash.changeToKnockout") : t("admin.tournamentDash.changeToLeague")}
                    </SportButton>
                  </form>
                </div>
              </div>
            </SportCard>
          )}

          {/* Quick Actions */}
          <SportCard padding="lg" variant="elevated">
            <h2 className="text-xl font-black text-foreground mb-4">{t("admin.tournamentDash.quickActions")}</h2>
            <div className="flex flex-wrap gap-3">
              {tournament.status === "registration_open" && (
                <form action={closeRegistration}>
                  <input type="hidden" name="tournamentId" value={tournamentId} />
                  <SportButton type="submit" variant="danger" size="sm">
                    <Lock className="w-4 h-4" />
                    {t("admin.tournamentDash.closeRegistration")}
                  </SportButton>
                </form>
              )}
              {tournament.status === "registration_closed" && (
                <>
                  <form action={openRegistration}>
                    <input type="hidden" name="tournamentId" value={tournamentId} />
                    <SportButton type="submit" variant="secondary" size="sm">
                      <Unlock className="w-4 h-4" />
                      {t("admin.tournamentDash.reopenRegistration")}
                    </SportButton>
                  </form>
                  <form action={startTournament}>
                    <input type="hidden" name="tournamentId" value={tournamentId} />
                    <SportButton type="submit" variant="primary" size="sm">
                      <Play className="w-4 h-4" />
                      {t("admin.tournamentDash.startTournament")}
                    </SportButton>
                  </form>
                </>
              )}
              {(tournament.status === "running" || tournament.status === "registration_closed") && matches.length === 0 && (
                <>
                  {isTeamTournament && isRandomDraw && (
                    <form action={runTeamDrawAction}>
                      <input type="hidden" name="tournamentId" value={tournamentId} />
                      <SportButton type="submit" variant={hasTeams ? "secondary" : "success"} size="sm">
                        <Shuffle className="w-4 h-4" />
                        {hasTeams ? t("admin.tournamentDash.redrawTeams") : t("admin.tournamentDash.drawTeams")}
                      </SportButton>
                    </form>
                  )}
                  <form action={generateMatchesAction}>
                    <input type="hidden" name="tournamentId" value={tournamentId} />
                    <SportButton 
                      type="submit" 
                      variant="success" 
                      size="sm"
                      disabled={needsTeamDraw || !tournament.type}
                    >
                      <Swords className="w-4 h-4" />
                      {t("admin.tournamentDash.generateMatches")}
                    </SportButton>
                  </form>
                  {needsTeamDraw && (
                    <span className="text-sm text-warning">{t("admin.tournamentDash.needsTeamDraw")}</span>
                  )}
                  {!tournament.type && (
                    <span className="text-sm text-warning">{t("admin.tournamentDash.needsTournamentType")}</span>
                  )}
                </>
              )}
            </div>
          </SportCard>

          {/* Add Participant */}
          <SportCard padding="lg" variant="elevated">
            <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              {t("admin.tournamentDash.addParticipants")}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-muted">{t("admin.tournamentDash.addSingle")}</h3>
                <form action={addParticipant} className="flex gap-2">
                  <input type="hidden" name="tournamentId" value={tournamentId} />
                  <input
                    type="text"
                    name="name"
                    placeholder={t("admin.tournamentDash.participantName")}
                    required
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <SportButton type="submit" variant="primary" size="sm">
                    {t("admin.tournamentDash.add")}
                  </SportButton>
                </form>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-muted">{t("admin.tournamentDash.addBulk")}</h3>
                <form action={addParticipantsBulk} className="space-y-2">
                  <input type="hidden" name="tournamentId" value={tournamentId} />
                  <textarea
                    name="names"
                    rows={4}
                    placeholder={language === "ar" ? "أحمد\nمحمد\nعلي" : "Ahmed\nMohamed\nAli"}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                  <SportButton type="submit" variant="secondary" size="sm" className="w-full">
                    {t("admin.tournamentDash.addAll")}
                  </SportButton>
                </form>
              </div>
            </div>
          </SportCard>

          {/* Participants List */}
          <SportCard padding="lg" variant="elevated">
            <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {t("admin.tournamentDash.participants")} ({participants.length})
            </h2>
            {participants.length === 0 ? (
              <p className="text-muted text-center py-8">{t("admin.tournamentDash.noParticipantsYet")}</p>
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
                        confirmMessage={t("admin.tournamentDash.deleteParticipant")}
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

          {/* Teams Section */}
          {isTeamTournament && (
            <SportCard padding="lg" variant="elevated">
              <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
                <UsersRound className="w-5 h-5 text-accent" />
                {t("admin.tournamentDash.teams")} ({teams.length})
                {isRandomDraw && (
                  <SportBadge variant="info">{t("admin.tournamentDash.randomDrawBadge")}</SportBadge>
                )}
              </h2>
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted">{t("admin.tournamentDash.teamsNotDrawn")}</p>
                  {participants.length >= 4 && (
                    <p className="text-sm text-muted mt-2">{t("admin.tournamentDash.useDrawButton")}</p>
                  )}
                  {participants.length < 4 && (
                    <p className="text-sm text-warning mt-2">{t("admin.tournamentDash.needMinPlayers")}</p>
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
                          <span className="font-black text-foreground">{team.name || t("admin.tournamentDash.unnamed")}</span>
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
                {t("admin.tournamentDash.matches")} ({matches.length})
              </h2>
              <div className="grid gap-3">
                {matches.slice(0, 20).map((match) => {
                  const homeTeamMembers = isTeamTournament && match.home_team_id
                    ? (teamMembersMap.get(match.home_team_id) || []).map(m => m.participantName)
                    : [];
                  const awayTeamMembers = isTeamTournament && match.away_team_id
                    ? (teamMembersMap.get(match.away_team_id) || []).map(m => m.participantName)
                    : [];
                  
                  return (
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
                      homeMembers={homeTeamMembers}
                      awayMembers={awayTeamMembers}
                    />
                  );
                })}
                {matches.length > 20 && (
                  <p className="text-center text-muted py-2">
                    + {matches.length - 20} {t("admin.tournamentDash.moreMatches")}
                  </p>
                )}
              </div>
            </SportCard>
          )}

          {/* Reset Tournament */}
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
