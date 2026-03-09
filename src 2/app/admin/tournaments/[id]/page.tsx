import { redirect, notFound } from "next/navigation";
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
import AdminTournamentDashContent from "@/components/AdminTournamentDashContent";

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

  return (
    <AdminTournamentDashContent
      tournament={tournament}
      participants={participants}
      matches={matches}
      teams={teams}
      teamMembers={teamMembers}
      addParticipant={addParticipant}
      addParticipantsBulk={addParticipantsBulk}
      removeParticipant={removeParticipant}
      closeRegistration={closeRegistration}
      openRegistration={openRegistration}
      startTournament={startTournament}
      generateMatchesAction={generateMatchesAction}
      runTeamDrawAction={runTeamDrawAction}
      setTournamentType={setTournamentType}
      setTournamentFormat={setTournamentFormat}
      updateTeamName={updateTeamName}
      updateMatchScore={updateMatchScore}
      resetToRegistrationOpen={resetToRegistrationOpen}
      resetToRegistrationClosed={resetToRegistrationClosed}
      resetToTypeSelection={resetToTypeSelection}
      resetToAfterTeamDraw={resetToAfterTeamDraw}
      resetToAfterMatchGeneration={resetToAfterMatchGeneration}
    />
  );
}
