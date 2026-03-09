import { getPublicTournaments, getParticipants } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import SportPageLayout from "@/components/SportPageLayout";
import { TournamentsListContent } from "@/components/TournamentsListContent";

export const dynamic = "force-dynamic";

export default async function PublicTournamentsPage() {
  const tournaments = await getPublicTournaments();
  const currentUser = await getCurrentUser();
  
  // Fetch registration status for each tournament
  const tournamentsWithRegistration = await Promise.all(
    tournaments.map(async (tournament) => {
      const participants = await getParticipants(tournament.id);
      const isUserRegistered = currentUser 
        ? participants.some(p => p.user_id === currentUser.id)
        : false;
      
      return {
        ...tournament,
        isUserRegistered,
        participantCount: participants.length,
      };
    })
  );

  // Separate active vs finished tournaments
  const activeTournaments = tournamentsWithRegistration.filter(
    (t) => t.status !== "finished"
  );
  
  const finishedTournaments = tournamentsWithRegistration.filter(
    (t) => t.status === "finished"
  );

  // Sort active by priority: running > registration_open > registration_closed > pending
  const statusPriority: Record<string, number> = {
    running: 1,
    registration_open: 2,
    registration_closed: 3,
    pending: 4,
  };
  
  activeTournaments.sort((a, b) => {
    const aPriority = statusPriority[a.status] ?? 99;
    const bPriority = statusPriority[b.status] ?? 99;
    return aPriority - bPriority;
  });

  // Sort finished by most recent first
  finishedTournaments.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });

  return (
    <SportPageLayout>
      <TournamentsListContent 
        activeTournaments={activeTournaments}
        finishedTournaments={finishedTournaments}
        isLoggedIn={!!currentUser}
      />
    </SportPageLayout>
  );
}
