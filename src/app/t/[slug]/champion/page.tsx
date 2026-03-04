import { redirect } from "next/navigation";
import { getTournamentBySlug, getTournamentById, getMatches, getParticipants, getTeams, getTeamMembersByTournament } from "@/lib/data";
import { isUuid, encodeSlug } from "@/lib/slug";
import { ChampionContent } from "@/components/ChampionContent";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ChampionPage(props: Props) {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);
  const tournament = await getTournamentBySlug(slug);

  if (!tournament && isUuid(slug)) {
    const byId = await getTournamentById(slug);
    if (byId) {
      redirect(`/t/${encodeSlug(byId.slug)}/champion`);
    }
  }

  if (!tournament) {
    redirect("/tournaments");
  }

  // Only show champion page for finished tournaments
  if (tournament.status !== "finished") {
    redirect(`/t/${encodeSlug(tournament.slug)}`);
  }

  const matches = await getMatches(tournament.id);
  const participants = await getParticipants(tournament.id);
  const teams = await getTeams(tournament.id);
  const teamMembers = await getTeamMembersByTournament(tournament.id);
  
  const nameMap = new Map(participants.map((p) => [p.id, p.name]));
  const teamNameMap = new Map(teams.map((t) => [t.id, t.name]));
  const teamMembersMap = new Map<string, string[]>();
  for (const tm of teamMembers) {
    const members = teamMembersMap.get(tm.team_id) || [];
    const participantName = tm.participant_id ? (nameMap.get(tm.participant_id) || "—") : "—";
    members.push(participantName);
    teamMembersMap.set(tm.team_id, members);
  }

  const playersPerTeam = tournament.players_per_team ?? 1;
  const isTeamBased = playersPerTeam === 2;

  // Find champion from completed matches
  let championName = "—";
  let championMembers: string[] = [];
  
  if (tournament.type === "knockout") {
    // Find final match winner
    const finalMatch = matches
      .filter(m => m.status === "completed")
      .sort((a, b) => b.round - a.round)[0];
    
    if (finalMatch) {
      if (isTeamBased && finalMatch.winner_team_id) {
        championName = teamNameMap.get(finalMatch.winner_team_id) || "—";
        championMembers = teamMembersMap.get(finalMatch.winner_team_id) || [];
      } else if (!isTeamBased && finalMatch.winner_participant_id) {
        championName = nameMap.get(finalMatch.winner_participant_id) || "—";
      }
    }
  }

  return (
    <ChampionContent
      tournament={tournament}
      championName={championName}
      championMembers={championMembers}
      isTeamBased={isTeamBased}
    />
  );
}
