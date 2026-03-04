import { redirect } from "next/navigation";
import { getTournamentById, getTournamentBySlug, getMatches, getParticipants, getTeams, getTeamMembersByTournament } from "@/lib/data";
import { isUuid, encodeSlug } from "@/lib/slug";
import { StandingsContent } from "@/components/StandingsContent";

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

  const playersPerTeam = tournament.players_per_team ?? 1;
  const isTeamBased = playersPerTeam === 2;

  const nameMap = new Map(participants.map((p) => [p.id, p.name]));
  const teamMembersMap = new Map<string, string[]>();
  for (const tm of teamMembers) {
    const members = teamMembersMap.get(tm.team_id) || [];
    const participantName = tm.participant_id ? (nameMap.get(tm.participant_id) || "—") : "—";
    members.push(participantName);
    teamMembersMap.set(tm.team_id, members);
  }

  return (
    <StandingsContent
      tournament={tournament}
      participants={participants}
      matches={matches}
      teams={teams}
      teamMembersMap={teamMembersMap}
      isTeamBased={isTeamBased}
    />
  );
}
