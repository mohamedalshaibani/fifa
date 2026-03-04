import { getPublicTournaments } from "@/lib/data";
import SportPageLayout from "@/components/SportPageLayout";
import { TournamentsListContent } from "@/components/TournamentsListContent";

export default async function PublicTournamentsPage() {
  const tournaments = await getPublicTournaments();

  return (
    <SportPageLayout>
      <TournamentsListContent tournaments={tournaments} />
    </SportPageLayout>
  );
}
