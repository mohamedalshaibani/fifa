import Card from "@/components/Card";
import Container from "@/components/Container";
import { getLatestTournament, getParticipants } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage() {
  const tournament = await getLatestTournament();
  const participants = tournament ? await getParticipants(tournament.id) : [];

  return (
    <Container>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">المشاركون</h1>
      </header>

      <Card>
        {!tournament ? (
          <p className="text-sm text-slate-600">لا توجد بطولة حالياً.</p>
        ) : participants.length === 0 ? (
          <p className="text-sm text-slate-600">لا يوجد مشاركون بعد.</p>
        ) : (
          <ul className="space-y-2 text-sm text-slate-700">
            {participants.map((participant, index) => (
              <li
                key={participant.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <span>{participant.name}</span>
                <span className="text-xs text-slate-500">#{index + 1}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
}
