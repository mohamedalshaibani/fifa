import { redirect } from "next/navigation";
import { getTournamentById, getTournamentBySlug, getParticipants } from "@/lib/data";
import { isUuid, encodeSlug } from "@/lib/slug";
import { ParticipantsContent } from "@/components/ParticipantsContent";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ParticipantsPage(props: Props) {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);
  const tournament = await getTournamentBySlug(slug);

  if (!tournament && isUuid(slug)) {
    const byId = await getTournamentById(slug);
    if (byId) {
      redirect(`/t/${encodeSlug(byId.slug)}/participants`);
    }
  }

  if (!tournament) {
    redirect("/tournaments");
  }

  const participants = await getParticipants(tournament.id);

  return (
    <ParticipantsContent
      tournament={tournament}
      participants={participants}
    />
  );
}
