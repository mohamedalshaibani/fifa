import Card from "@/components/Card";
import Container from "@/components/Container";
import { getLatestTournament, getMatches, getParticipants } from "@/lib/data";
import { computeStandings } from "@/lib/tournament-utils";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const tournament = await getLatestTournament();
  const participants = tournament ? await getParticipants(tournament.id) : [];
  const matches = tournament ? await getMatches(tournament.id) : [];

  if (!tournament || tournament.type !== "league") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f3f7f2] via-[#f1f5f9] to-[#eef2f7]">
        <Container>
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">الترتيب</h1>
        </header>
        <Card>
          <p className="text-sm text-slate-600">الترتيب متاح فقط للبطولات بنظام الدوري.</p>
        </Card>
      </Container>
      </div>
    );
  }

  const standings = computeStandings(participants, matches);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f7f2] via-[#f1f5f9] to-[#eef2f7]">
      <Container>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">الترتيب</h1>
      </header>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="py-2">#</th>
                <th className="py-2">اللاعب</th>
                <th className="py-2">لعب</th>
                <th className="py-2">ف</th>
                <th className="py-2">ت</th>
                <th className="py-2">خ</th>
                <th className="py-2">له</th>
                <th className="py-2">عليه</th>
                <th className="py-2">فارق</th>
                <th className="py-2">نقاط</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, index) => (
                <tr key={row.participant.id} className="border-t border-slate-100">
                  <td className="py-2 text-slate-500">{index + 1}</td>
                  <td className="py-2 font-medium">{row.participant.name}</td>
                  <td className="py-2">{row.played}</td>
                  <td className="py-2">{row.wins}</td>
                  <td className="py-2">{row.draws}</td>
                  <td className="py-2">{row.losses}</td>
                  <td className="py-2">{row.goalsFor}</td>
                  <td className="py-2">{row.goalsAgainst}</td>
                  <td className="py-2">{row.goalDiff}</td>
                  <td className="py-2 font-semibold text-teal-700">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Container>
    </div>
  );
}
