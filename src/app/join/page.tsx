import Card from "@/components/Card";
import Container from "@/components/Container";
import { getLatestTournament } from "@/lib/data";
import JoinForm from "@/app/join/JoinForm";

export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const tournament = await getLatestTournament();
  const allowJoin =
    tournament?.status === "registration_open" &&
    tournament?.allow_public_registration;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f7f2] via-[#f1f5f9] to-[#eef2f7]">
      <Container>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">التسجيل العام</h1>
      </header>

      <Card>
        {!tournament ? (
          <p className="text-sm text-slate-600">لا توجد بطولة حالياً.</p>
        ) : allowJoin ? (
          <JoinForm />
        ) : (
          <p className="text-sm text-slate-600">
            التسجيل العام غير متاح حالياً. يرجى التواصل مع المشرف.
          </p>
        )}
      </Card>
    </Container>
    </div>
  );
}
