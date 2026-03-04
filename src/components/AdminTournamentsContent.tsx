"use client";

import { Plus, Settings, Trash2, Calendar } from "lucide-react";
import Container from "@/components/Container";
import AdminLayout from "@/components/AdminLayout";
import SportCard from "@/components/ui/SportCard";
import SportButton from "@/components/ui/SportButton";
import SportBadge from "@/components/ui/SportBadge";
import { DeleteButton } from "@/components/DeleteButton";
import Link from "next/link";
import TournamentCreateForm from "@/components/TournamentCreateForm";
import { useLanguage } from "@/lib/i18n";
import type { Tournament } from "@/lib/types";

interface AdminTournamentsContentProps {
  tournaments: Tournament[];
  deleteTournament: (formData: FormData) => Promise<void>;
}

export default function AdminTournamentsContent({ 
  tournaments, 
  deleteTournament 
}: AdminTournamentsContentProps) {
  const { t, language } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return t("admin.tournaments.statusRunning");
      case "registration_open":
        return t("admin.tournaments.statusRegistration");
      case "finished":
        return t("admin.tournaments.statusFinished");
      default:
        return t("admin.tournaments.statusUpcoming");
    }
  };

  return (
    <AdminLayout>
      <Container>
        <div className="py-12 md:py-16 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/bg border border-accent/40">
              <Settings className="w-4 h-4 text-accent" />
              <span className="text-sm font-extrabold text-accent uppercase tracking-[0.18em]">
                {t("admin.tournaments.title")}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary">
              {t("admin.tournaments.title")}
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              {t("admin.tournaments.subtitle")}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SportCard padding="base" variant="default">
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold text-muted uppercase tracking-widest">
                  {t("admin.tournaments.total")}
                </div>
                <div className="text-3xl font-black text-foreground">
                  {tournaments.length}
                </div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="highlighted">
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold text-muted uppercase tracking-widest">
                  {t("admin.tournaments.running")}
                </div>
                <div className="text-3xl font-black text-accent">
                  {tournaments.filter(t => t.status === "running").length}
                </div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="warning">
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold text-muted uppercase tracking-widest">
                  {t("admin.tournaments.completed")}
                </div>
                <div className="text-3xl font-black text-secondary">
                  {tournaments.filter(t => t.status === "finished").length}
                </div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="default">
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold text-muted uppercase tracking-widest">
                  {t("admin.tournaments.pending")}
                </div>
                <div className="text-3xl font-black text-foreground">
                  {tournaments.filter(t => t.status === "pending").length}
                </div>
              </div>
            </SportCard>
          </div>

          {/* Create Tournament Section */}
          <SportCard
            padding="lg"
            variant="elevated"
            className="border-l-4 border-l-accent shadow-[0_12px_30px_rgba(0,92,255,0.25)]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Plus className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-extrabold text-foreground">{t("admin.tournaments.newTournament")}</h2>
            </div>
            <TournamentCreateForm />
          </SportCard>

          {/* Tournament List */}
          <div className="space-y-3">
              {tournaments.length === 0 ? (
                <SportCard padding="lg" variant="elevated" className="text-center">
                  <p className="text-lg text-muted">{t("admin.tournaments.noTournamentsYet")}</p>
                </SportCard>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-lg font-extrabold text-foreground mb-4">
                    {t("admin.tournaments.tournamentsList")} ({tournaments.length})
                  </h3>
                  {tournaments
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((tournament) => (
                      <SportCard key={tournament.id} padding="base" hoverable variant={tournament.status === "running" ? "highlighted" : "default"}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-extrabold text-foreground truncate">
                                {tournament.name}
                              </h3>
                              <SportBadge 
                                variant={tournament.status === "running" ? "primary" : "info"}
                              >
                                {getStatusBadge(tournament.status)}
                              </SportBadge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-primary" />
                                {new Date(tournament.created_at).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                              </span>
                              {tournament.type && (
                                <span className="px-2 py-1 rounded-full bg-secondary/15 text-secondary font-bold">
                                  {tournament.type === "league" ? t("admin.tournaments.typeLeague") : t("admin.tournaments.typeKnockout")}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link href={`/admin/tournaments/${tournament.id}`}>
                              <SportButton variant="secondary" size="sm" className="font-bold">
                                <Settings className="w-4 h-4" />
                                {t("admin.manage")}
                              </SportButton>
                            </Link>

                            <form action={deleteTournament} className="flex-shrink-0">
                              <input type="hidden" name="tournamentId" value={tournament.id} />
                              <DeleteButton
                                confirmMessage={t("admin.tournaments.deleteConfirm")}
                                className="px-3 py-2 h-9 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 hover:border-danger transition-all font-bold text-sm flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                {t("admin.tournaments.delete")}
                              </DeleteButton>
                            </form>
                          </div>
                        </div>
                      </SportCard>
                    ))}
                </div>
              )}
          </div>
        </div>
      </Container>
    </AdminLayout>
  );
}
