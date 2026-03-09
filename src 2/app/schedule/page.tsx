import Card from "@/components/Card";
import Container from "@/components/Container";
import { getLatestTournament, getMatches, getParticipants } from "@/lib/data";
import { Match } from "@/lib/types";

export const dynamic = "force-dynamic";

function groupByRound(matches: Match[]) {
  return matches.reduce<Record<string, Match[]>>((acc, match) => {
    const key = String(match.round);
    acc[key] = acc[key] ?? [];
    acc[key].push(match);
    return acc;
  }, {});
}

export default async function SchedulePage() {
  const tournament = await getLatestTournament();
  const participants = tournament ? await getParticipants(tournament.id) : [];
  const matches = tournament ? await getMatches(tournament.id) : [];
  const nameMap = new Map(participants.map((p) => [p.id, p.name]));

  if (!tournament) {
    return (
      <Container>
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">الجدول</h1>
        </header>
        <Card>
          <p className="text-sm text-slate-600">لا توجد بطولة حالياً.</p>
        </Card>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f7f2] via-[#f1f5f9] to-[#eef2f7]">
      <Container>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">الجدول</h1>
      </header>

      <Card>
        {matches.length === 0 ? (
          <p className="text-sm text-slate-600">لم يتم إنشاء مباريات بعد.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupByRound(matches))
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([round, roundMatches]) => (
              <div key={round}>
                <h2 className="mb-3 text-sm font-semibold text-slate-700">
                  الجولة {round}
                </h2>
                <div className="space-y-3">
                  {roundMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                    >
                      <div className="flex flex-col">
                        <span>{nameMap.get(match.home_participant_id ?? "") ?? "-"}</span>
                        <span className="text-xs text-slate-500">ضد</span>
                        <span>{nameMap.get(match.away_participant_id ?? "") ?? "-"}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {match.home_score !== null && match.away_score !== null
                          ? `${match.home_score} - ${match.away_score}`
                          : "لم تلعب"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Container>
    </div>
  );
}
