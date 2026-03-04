import Card from "@/components/Card";
import Container from "@/components/Container";
import { getLatestTournament, getMatches, getParticipants } from "@/lib/data";
import { computeStandings } from "@/lib/tournament-utils";

export const dynamic = "force-dynamic";

export default async function ChampionPage() {
  const tournament = await getLatestTournament();
  const participants = tournament ? await getParticipants(tournament.id) : [];
  const matches = tournament ? await getMatches(tournament.id) : [];

  let championName: string | null = null;

  if (tournament?.status === "finished") {
    if (tournament.type === "league") {
      const standings = computeStandings(participants, matches);
      championName = standings[0]?.participant.name ?? null;
    } else if (tournament.type === "knockout") {
      const finalMatch = matches.reduce((latest, match) => {
        if (!latest) return match;
        if (match.round > latest.round) return match;
        return latest;
      }, matches[0]);
      const winnerId = finalMatch?.winner_participant_id ?? null;
      championName = participants.find((p) => p.id === winnerId)?.name ?? null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f7f2] via-[#f1f5f9] to-[#eef2f7]">
      <Container>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">البطل</h1>
      </header>
      <Card>
        {championName ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-500">مبروك!</p>
            <h2 className="text-2xl font-semibold text-teal-700">{championName}</h2>
          </div>
        ) : (
          <p className="text-sm text-slate-600">لم يتم تحديد البطل بعد.</p>
        )}
      </Card>
    </Container>
    </div>
  );
}
