import { redirect } from "next/navigation";
import Image from "next/image";
import { Trophy, Medal } from "lucide-react";
import Container from "@/components/Container";
import BackLink from "@/components/BackLink";
import StatusBadge from "@/components/StatusBadge";
import { getTournamentBySlug, getTournamentById, getMatches, getParticipants, getTeams, getTeamMembersByTournament } from "@/lib/data";
import { isUuid, encodeSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ChampionPage(props: Props) {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);
  const tournament = await getTournamentBySlug(slug);

  if (!tournament && isUuid(slug)) {
    const byId = await getTournamentById(slug);
    if (byId) {
      redirect(`/t/${encodeSlug(byId.slug)}/champion`);
    }
  }

  if (!tournament) {
    redirect("/tournaments");
  }

  // Only show champion page for finished tournaments
  if (tournament.status !== "finished") {
    redirect(`/t/${encodeSlug(tournament.slug)}`);
  }

  const matches = await getMatches(tournament.id);
  const participants = await getParticipants(tournament.id);
  const teams = await getTeams(tournament.id);
  const teamMembers = await getTeamMembersByTournament(tournament.id);
  
  const nameMap = new Map(participants.map((p) => [p.id, p.name]));
  const teamNameMap = new Map(teams.map((t) => [t.id, t.name]));
  const teamMembersMap = new Map<string, string[]>();
  for (const tm of teamMembers) {
    const members = teamMembersMap.get(tm.team_id) || [];
    const participantName = tm.participant_id ? (nameMap.get(tm.participant_id) || "—") : "—";
    members.push(participantName);
    teamMembersMap.set(tm.team_id, members);
  }

  const playersPerTeam = tournament.players_per_team ?? 1;
  const isTeamBased = playersPerTeam === 2;

  // Find champion from completed matches
  let championName = "غير محدد";
  let championMembers: string[] = [];
  
  if (tournament.type === "knockout") {
    // Find final match winner
    const finalMatch = matches
      .filter(m => m.status === "completed")
      .sort((a, b) => b.round - a.round)[0];
    
    if (finalMatch) {
      if (isTeamBased && finalMatch.winner_team_id) {
        championName = teamNameMap.get(finalMatch.winner_team_id) || "غير محدد";
        championMembers = teamMembersMap.get(finalMatch.winner_team_id) || [];
      } else if (!isTeamBased && finalMatch.winner_participant_id) {
        championName = nameMap.get(finalMatch.winner_participant_id) || "غير محدد";
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Container>
        {/* Broadcast TV Champion Celebration */}
        <div className="relative min-h-[80vh] overflow-hidden bg-white/70 backdrop-blur-md border border-border shadow-[0_8px_30px_rgba(5,8,22,0.08)]">
        {/* Stadium Background */}
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/assets/fc/backgrounds/stadium-lights.svg"
            alt="Stadium celebration"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/40 to-transparent"></div>
        </div>
        
        {/* Light Beams */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 left-1/4 w-2 h-full bg-gradient-to-b from-primary/40 via-primary/20 to-transparent transform -skew-x-12 animate-beam-sweep"></div>
          <div className="absolute top-0 right-1/4 w-2 h-full bg-gradient-to-b from-primary/40 via-primary/20 to-transparent transform skew-x-12 animate-beam-sweep" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-primary/40 via-primary/20 to-transparent animate-beam-sweep" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center py-20 px-6">
          {/* Champion Badge */}
          <div className="live-indicator mb-8">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            CHAMPION
          </div>
          
          {/* Trophy Display */}
          <div className="relative mb-12">
            <div className="w-48 h-48 rounded-full bg-gradient-to-b from-primary/20 to-transparent backdrop-blur-sm flex items-center justify-center border-4 border-primary/30 shadow-2xl animate-float">
              <Trophy className="w-32 h-32 text-primary drop-shadow-2xl" />
            </div>
            
            {/* Floating Celebration Elements */}
            <div className="absolute -top-4 -right-4 text-6xl animate-bounce" style={{animationDelay: '0.3s'}}>🏆</div>
            <div className="absolute -bottom-4 -left-4 text-5xl animate-bounce" style={{animationDelay: '0.6s'}}>👑</div>
            <div className="absolute -top-2 left-1/3 text-4xl animate-float" style={{animationDelay: '0.9s'}}>✨</div>
            <div className="absolute -right-2 top-1/2 text-3xl animate-float" style={{animationDelay: '1.2s'}}>⭐</div>
          </div>

          {/* Champion Announcement */}
          <div className="mb-10">
            <div className="text-accent font-black text-xl uppercase tracking-widest mb-4 animate-pulse">
              TOURNAMENT CHAMPION
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-foreground mb-6 leading-none heading-tight animate-slide-in-up">
              {championName}
            </h1>
            
            {/* Team Members Display */}
            {isTeamBased && championMembers.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 mb-8 animate-fade-in">
                {championMembers.map((member, idx) => (
                  <div key={idx} className="scoreboard inline-flex items-center gap-2 px-6 py-3">
                    <Medal className="h-5 w-5 text-primary" />
                    <span className="font-black text-foreground text-lg">{member}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tournament Info Strip */}
          <div className="scoreboard max-w-3xl w-full">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-foreground mb-2 heading-tight">{tournament.name}</h2>
                <div className="flex flex-wrap gap-3">
                  <StatusBadge status={tournament.status} />
                  <span className="bg-primary/15 text-primary px-4 py-1 rounded-full text-sm font-bold border border-primary/30">
                    {tournament.type === "league" ? "LEAGUE" : "KNOCKOUT"}
                  </span>
                  <span className="bg-surface-2 text-muted px-4 py-1 rounded-full text-sm font-bold">
                    {playersPerTeam === 2 ? "TEAMS" : "INDIVIDUAL"}
                  </span>
                </div>
              </div>
              <Trophy className="w-16 h-16 text-primary opacity-40" />
            </div>
          </div>

          {/* Celebration Message */}
          <p className="text-xl text-muted mt-8 max-w-2xl leading-relaxed animate-fade-in">
            تهانينا للبطل! إنجاز رائع في هذه البطولة المثيرة. 🎉
          </p>
        </div>
      </div>

      {/* Navigation Back */}
      <div className="text-center mt-8">
        <BackLink href={`/t/${encodeSlug(tournament.slug)}`} text="العودة إلى البطولة" />
      </div>
      </Container>
    </div>
  );
}
