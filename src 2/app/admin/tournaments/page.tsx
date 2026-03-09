import { redirect } from "next/navigation";
import { getAllTournaments } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import { deleteTournament } from "@/app/admin/actions";
import AdminTournamentsContent from "@/components/AdminTournamentsContent";

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
    <AdminTournamentsContent 
      tournaments={tournaments} 
      deleteTournament={deleteTournament}
    />
  );
}
