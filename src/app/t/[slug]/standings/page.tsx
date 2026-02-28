import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import Container from "@/components/Container";
import StatusBadge from "@/components/StatusBadge";
import { getTournamentById, getTournamentBySlug, getMatches, getParticipants, getTeams, getTeamMembersByTournament } from "@/lib/data";
import { computeStandings, computeTeamStandings } from "@/lib/tournament-utils";
import { isUuid, encodeSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function StandingsPage(props: Props) {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);
  const tournament = await getTournamentBySlug(slug);

  if (!tournament && isUuid(slug)) {
    const byId = await getTournamentById(slug);
    if (byId) {
      redirect(`/t/${encodeSlug(byId.slug)}/standings`);
    }
  }

  if (!tournament) {
    redirect("/tournaments");
  }

  if (tournament.type !== "league") {
    redirect(`/t/${encodeSlug(tournament.slug)}`);
  }

  const participants = await getParticipants(tournament.id);
  const matches = await getMatches(tournament.id);
  const teams = await getTeams(tournament.id);
  const teamMembers = await getTeamMembersByTournament(tournament.id);

  // Determine format
  const playersPerTeam = tournament.players_per_team ?? 1;
  const isTeamBased = playersPerTeam === 2;

  // Build team members map for display
  const nameMap = new Map(participants.map((p) => [p.id, p.name]));
  const teamMembersMap = new Map<string, string[]>();
  for (const tm of teamMembers) {
    const members = teamMembersMap.get(tm.team_id) || [];
    const participantName = tm.participant_id ? (nameMap.get(tm.participant_id) || "—") : "—";
    members.push(participantName);
    teamMembersMap.set(tm.team_id, members);
  }

  // Compute standings based on format
  const participantStandings = isTeamBased ? [] : computeStandings(participants, matches);
  const teamStandings = isTeamBased ? computeTeamStandings(teams, matches) : [];

  return (
    <div className="min-h-screen bg-background">
      <Container>
      {/* Broadcast TV Header */}
      <header className="mb-8">
        <div className="scoreboard mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="live-indicator">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                STANDINGS
              </div>
              <h1 className="text-2xl font-black text-foreground heading-tight">
                {tournament.name} - ترتيب {isTeamBased ? "الفرق" : "اللاعبين"}
              </h1>
            </div>
            <StatusBadge status={tournament.status} />
          </div>
        </div>
        
        <Link
          href={`/t/${encodeSlug(tournament.slug)}`}
          className="text-primary hover:text-primary-hover transition-colors font-bold text-sm"
        >
          ← العودة للبطولة
        </Link>
      </header>

      {/* Broadcast TV Standings Table */}
      <div className="scoreboard p-0 overflow-hidden">
        {(isTeamBased ? teamStandings.length : participantStandings.length) === 0 ? (
          <p className="text-muted p-8 text-center text-lg">لا توجد بيانات ترتيب بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="bg-primary/10 text-foreground p-4 border-b border-primary/20">
              <h2 className="text-xl font-black flex items-center gap-2">
                🏆 LEAGUE TABLE
              </h2>
            </div>
            
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/70 border-b border-slate-200">
                  <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-wider text-primary">#</th>
                  <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-wider text-primary">{isTeamBased ? "TEAM" : "PLAYER"}</th>
                  <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">P</th>
                  <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">W</th>
                  <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">D</th>
                  <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">L</th>
                  <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">GF</th>
                  <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">GA</th>
                  <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">GD</th>
                  <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">PTS</th>
                </tr>
              </thead>
              <tbody>
                {isTeamBased ? (
                  // Team-based standings - Broadcast TV Style
                  teamStandings.map((standing, index) => {
                    const isChampion = index === 0;
                    const isPodium = index < 3;
                    const positionClass = isChampion 
                      ? "bg-gold/10 border-l-4 border-gold animate-scoreboard-glow" 
                      : index === 1 
                      ? "bg-silver/10 border-l-4 border-silver" 
                      : index === 2 
                      ? "bg-bronze/10 border-l-4 border-bronze" 
                      : "bg-white/60 hover:bg-white/70";
                    
                    const members = teamMembersMap.get(standing.team.id) || [];
                    
                    return (
                      <tr
                        key={standing.team.id}
                        className={`border-b border-slate-200 transition-all duration-300 ${positionClass}`}
                      >
                        {/* Position */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`text-xl ${isChampion ? 'animate-float' : ''}`}>
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
                            </span>
                            <span className={`font-black text-lg ${isPodium ? 'text-primary' : 'text-foreground'}`}>
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        
                        {/* Team Name */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center gap-3 justify-end">
                            <div>
                              <p className={`font-black text-lg ${isChampion ? 'text-primary animate-pulse' : 'text-foreground'}`}>
                                {standing.team.name}
                              </p>
                              {members.length > 0 && (
                                <p className="text-xs text-muted mt-0.5 leading-tight">{members.join(' • ')}</p>
                              )}
                            </div>
                              <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary">{(standing.team.name || "T").charAt(0)}</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Stats - TV Scoreboard Style */}
                        <td className="px-4 py-4 text-center">
                          <span className="font-black text-foreground text-lg">{standing.played}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-black text-primary text-lg">{standing.wins}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-muted text-lg">{standing.draws}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-black text-muted text-lg">{standing.losses}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-foreground text-lg">{standing.goalsFor}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-muted text-lg">{standing.goalsAgainst}</span>
                        </td>
                        <td className={`px-4 py-4 text-center font-black text-lg ${
                          standing.goalDiff > 0 ? 'text-primary' : standing.goalDiff < 0 ? 'text-muted' : 'text-muted'
                        }`}>
                          {standing.goalDiff >= 0 ? "+" : ""}{standing.goalDiff}
                        </td>
                        
                        {/* Points - Featured */}
                        <td className="px-4 py-4 text-center">
                          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg font-black text-xl border-2 ${
                            isChampion 
                              ? 'bg-primary/15 text-foreground border-primary/30 shadow-lg animate-pulse' 
                              : 'bg-white/70 text-primary border-primary/30'
                          }`}>
                            {standing.points}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  // Participant-based standings - Broadcast TV Style
                  participantStandings.map((standing, index) => {
                    const isChampion = index === 0;
                    const isPodium = index < 3;
                    const positionClass = isChampion 
                      ? "bg-gold/10 border-l-4 border-gold animate-scoreboard-glow" 
                      : index === 1 
                      ? "bg-silver/10 border-l-4 border-silver" 
                      : index === 2 
                      ? "bg-bronze/10 border-l-4 border-bronze" 
                      : "bg-white/60 hover:bg-white/70";
                    
                    return (
                      <tr
                        key={standing.participant.id}
                        className={`border-b border-slate-200 transition-all duration-300 ${positionClass}`}
                      >
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`text-xl ${isChampion ? 'animate-float' : ''}`}>
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
                            </span>
                            <span className={`font-black text-lg ${isPodium ? 'text-primary' : 'text-foreground'}`}>
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`font-black text-lg ${isChampion ? 'text-primary animate-pulse' : 'text-foreground'}`}>
                            {standing.participant.name}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-black text-foreground text-lg">{standing.played}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-black text-primary text-lg">{standing.wins}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-muted text-lg">{standing.draws}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-black text-muted text-lg">{standing.losses}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-foreground text-lg">{standing.goalsFor}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-muted text-lg">{standing.goalsAgainst}</span>
                        </td>
                        <td className={`px-4 py-4 text-center font-black text-lg ${
                          standing.goalDiff > 0 ? 'text-primary' : standing.goalDiff < 0 ? 'text-muted' : 'text-muted'
                        }`}>
                          {standing.goalDiff >= 0 ? "+" : ""}{standing.goalDiff}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg font-black text-xl border-2 ${
                            isChampion 
                              ? 'bg-primary/15 text-foreground border-primary/30 shadow-lg animate-pulse' 
                              : 'bg-white/70 text-primary border-primary/30'
                          }`}>
                            {standing.points}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/t/${encodeSlug(tournament.slug)}/participants`}
          className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
        >
          <Users className="h-4 w-4 text-primary" />
          المشاركون
        </Link>
        <Link
          href={`/t/${encodeSlug(tournament.slug)}/schedule`}
          className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
        >
          <CalendarDays className="h-4 w-4 text-primary" />
          الجدول
        </Link>
      </div>
      </Container>
    </div>
  );
}
