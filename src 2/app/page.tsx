import { getAllTournaments, getParticipants, getMatches, computeUserStatsFromMatches, getUserTournamentPlacementStats } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import SportPageLayout from "@/components/SportPageLayout";
import { HomePageContent } from "@/components/HomePageContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tournaments = await getAllTournaments();
  const currentUser = await getCurrentUser();
  
  // Fetch user stats and placement stats if logged in
  const userStats = currentUser ? await computeUserStatsFromMatches(currentUser.id) : null;
  const placementStats = currentUser ? await getUserTournamentPlacementStats(currentUser.id) : null;
  
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

  // Serialize user data for client component
  const serializedUser = currentUser ? {
    id: currentUser.id,
    firstName: currentUser.firstName ?? undefined,
    email: currentUser.email ?? undefined,
  } : null;

  return (
    <SportPageLayout>
      <HomePageContent
        currentUser={serializedUser}
        activeTournaments={activeTournaments}
        finishedTournaments={finishedTournaments}
        userStats={userStats}
        placementStats={placementStats}
      />
    </SportPageLayout>
  );
}
