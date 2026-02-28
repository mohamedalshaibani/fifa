import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, BarChart3, GitBranch, CalendarDays } from "lucide-react";
import Card from "@/components/Card";
import Container from "@/components/Container";
import StatusBadge from "@/components/StatusBadge";
import { getTournamentById, getTournamentBySlug, getParticipants } from "@/lib/data";
import { isUuid, encodeSlug } from "@/lib/slug";

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
    <div className="min-h-screen bg-background">
      <Container>
        <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href={`/t/${encodeSlug(tournament.slug)}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-90 mb-3"
            >
              ← {tournament.name}
            </Link>
            <h1 className="text-3xl font-black text-foreground inline-flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              المشاركون
            </h1>
          </div>
          <StatusBadge status={tournament.status} />
        </div>
      </header>

      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-lg font-bold text-foreground">قائمة المشاركين</h2>
            <span className="button-secondary px-4 py-2 text-xs font-semibold">
              {participants.length} مشارك
            </span>
          </div>

          {participants.length === 0 ? (
            <p className="text-sm text-muted">لا يوجد مشاركون بعد.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {participants.map((participant, index) => (
                <li
                  key={participant.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-foreground">{participant.name}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-wrap gap-3">
          {tournament.type === "league" && (
            <Link
              href={`/t/${encodeSlug(tournament.slug)}/standings`}
              className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4 text-primary" />
              الترتيب
            </Link>
          )}
          {tournament.type === "knockout" && (
            <Link
              href={`/t/${encodeSlug(tournament.slug)}/bracket`}
              className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
            >
              <GitBranch className="h-4 w-4 text-primary" />
              الشجرة
            </Link>
          )}
          <Link
            href={`/t/${encodeSlug(tournament.slug)}/schedule`}
            className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
          >
            <CalendarDays className="h-4 w-4 text-primary" />
            الجدول
          </Link>
        </div>
      </div>
      </Container>
    </div>
  );
}
