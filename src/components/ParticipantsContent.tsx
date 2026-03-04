"use client";

import Link from "next/link";
import { Users, BarChart3, GitBranch, CalendarDays } from "lucide-react";
import Card from "@/components/Card";
import Container from "@/components/Container";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import { encodeSlug } from "@/lib/slug";
import { Tournament, Participant } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

interface ParticipantsContentProps {
  tournament: Tournament;
  participants: Participant[];
}

export function ParticipantsContent({
  tournament,
  participants,
}: ParticipantsContentProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Container>
        <PageHeader
          title={t("participantsPage.title")}
          icon={<Users className="h-6 w-6 text-primary" />}
          backHref={`/t/${encodeSlug(tournament.slug)}`}
          backText={tournament.name}
          badge={<StatusBadge status={tournament.status} />}
        />

        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-bold text-foreground">{t("participantsPage.list")}</h2>
              <span className="button-secondary px-4 py-2 text-xs font-semibold">
                {participants.length} {t("participantsPage.count")}
              </span>
            </div>

            {participants.length === 0 ? (
              <p className="text-sm text-muted">{t("participantsPage.noParticipantsYet")}</p>
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
                {t("participantsPage.standings")}
              </Link>
            )}
            {tournament.type === "knockout" && (
              <Link
                href={`/t/${encodeSlug(tournament.slug)}/bracket`}
                className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
              >
                <GitBranch className="h-4 w-4 text-primary" />
                {t("participantsPage.bracket")}
              </Link>
            )}
            <Link
              href={`/t/${encodeSlug(tournament.slug)}/schedule`}
              className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4 text-primary" />
              {t("participantsPage.schedule")}
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
