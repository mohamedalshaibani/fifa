import { Suspense } from "react";
import Container from "@/components/Container";
import LeaderboardContent from "./LeaderboardContent";

export const dynamic = "force-dynamic";

export default function LeaderboardPage() {
  return (
    <Container className="py-6 sm:py-10">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      }>
        <LeaderboardContent />
      </Suspense>
    </Container>
  );
}
