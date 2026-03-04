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

  return (
    <SportPageLayout>
      <TournamentsListContent 
        tournaments={tournamentsWithRegistration}
        isLoggedIn={!!currentUser}
      />
    </SportPageLayout>
  );
}
