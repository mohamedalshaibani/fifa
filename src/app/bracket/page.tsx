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

export default async function BracketPage() {
  const tournament = await getLatestTournament();
  const participants = tournament ? await getParticipants(tournament.id) : [];
  const matches = tournament ? await getMatches(tournament.id) : [];
  const nameMap = new Map(participants.map((p) => [p.id, p.name]));

  if (!tournament || tournament.type !== "knockout") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f3f7f2] via-[#f1f5f9] to-[#eef2f7]">
        <Container>
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">الشجرة</h1>
        </header>
        <Card>
          <p className="text-sm text-slate-600">الشجرة متاحة فقط لنظام خروج المغلوب.</p>
        </Card>
      </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f7f2] via-[#f1f5f9] to-[#eef2f7]">
      <Container>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">الشجرة</h1>
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
                      className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span>{nameMap.get(match.home_participant_id ?? "") ?? "-"}</span>
                        <span className="text-xs text-slate-500">
                          {match.home_score !== null && match.away_score !== null
                            ? `${match.home_score} - ${match.away_score}`
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{nameMap.get(match.away_participant_id ?? "") ?? "-"}</span>
                        {match.winner_participant_id ? (
                          <span className="text-xs text-emerald-700">تأهل</span>
                        ) : null}
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
