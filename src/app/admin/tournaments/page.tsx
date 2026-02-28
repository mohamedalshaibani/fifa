import { redirect } from "next/navigation";
import { Plus, Settings, Trash2, Calendar } from "lucide-react";
import Container from "@/components/Container";
import AdminLayout from "@/components/AdminLayout";
import SportCard from "@/components/ui/SportCard";
import SportButton from "@/components/ui/SportButton";
import SportBadge from "@/components/ui/SportBadge";
import { DeleteButton } from "@/components/DeleteButton";
import { getAllTournaments } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import { deleteTournament } from "@/app/admin/actions";
import Link from "next/link";
import TournamentCreateForm from "@/components/TournamentCreateForm";

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    redirect("/");
  }

  // NOTE: getAllTournaments() now uses createAdminClient() (service role)
  // This bypasses the RLS 42P17 infinite recursion error that blocked anon key queries
  const tournaments = await getAllTournaments();

  return (
    <AdminLayout>
      <Container>
        <div className="py-12 md:py-16 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/bg border border-accent/40">
              <Settings className="w-4 h-4 text-accent" />
              <span className="text-sm font-extrabold text-accent uppercase tracking-[0.18em]">
                إدارة البطولات
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary">
              إدارة البطولات
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              إنشاء وتحرير وحذف البطولات
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SportCard padding="base" variant="default">
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold text-muted uppercase tracking-widest">
                  إجمالي
                </div>
                <div className="text-3xl font-black text-foreground">
                  {tournaments.length}
                </div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="highlighted">
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold text-muted uppercase tracking-widest">
                  جارية
                </div>
                <div className="text-3xl font-black text-accent">
                  {tournaments.filter(t => t.status === "running").length}
                </div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="warning">
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold text-muted uppercase tracking-widest">
                  مكتملة
                </div>
                <div className="text-3xl font-black text-secondary">
                  {tournaments.filter(t => t.status === "finished").length}
                </div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="default">
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold text-muted uppercase tracking-widest">
                  انتظار
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
              <h2 className="text-xl font-extrabold text-foreground">بطولة جديدة</h2>
            </div>
            <TournamentCreateForm />
          </SportCard>

          {/* Tournament List */}
          <div className="space-y-3">
              {tournaments.length === 0 ? (
                <SportCard padding="lg" variant="elevated" className="text-center">
                  <p className="text-lg text-muted">📭 لا توجد بطولات بعد</p>
                </SportCard>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-lg font-extrabold text-foreground mb-4">
                    البطولات ({tournaments.length})
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
                                {tournament.status === "running" ? "🔴 جارية" :
                                 tournament.status === "registration_open" ? "🟡 تسجيل" :
                                 tournament.status === "finished" ? "⚪ انتهت" : "🟤 قادمة"}
                              </SportBadge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-primary" />
                                {new Date(tournament.created_at).toLocaleDateString("ar-SA")}
                              </span>
                              {tournament.type && (
                                <span className="px-2 py-1 rounded-full bg-secondary/15 text-secondary font-bold">
                                  {tournament.type === "league" ? "🏆 دوري" : "⚡ خروج مباشر"}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link href={`/admin/tournaments/${tournament.id}`}>
                              <SportButton variant="secondary" size="sm" className="font-bold">
                                <Settings className="w-4 h-4" />
                                إدارة
                              </SportButton>
                            </Link>

                            <form action={deleteTournament} className="flex-shrink-0">
                              <input type="hidden" name="tournamentId" value={tournament.id} />
                              <DeleteButton
                                confirmMessage="⚠️ حذف نهائي!"
                                className="px-3 py-2 h-9 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 hover:border-danger transition-all font-bold text-sm flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                حذف
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
