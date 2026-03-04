import { redirect } from "next/navigation";
import {
  getTournamentById,
  getTournamentBySlug,
  getParticipants,
  getMatches,
  getTeams,
  getTeamMembersByTournament,
  getUserProfiles,
} from "@/lib/data";
import type { TeamMemberInfo } from "@/components/TeamCard";
import { isUuid, encodeSlug } from "@/lib/slug";
import { checkTournamentSetupStatus } from "@/lib/empty-state";
import { requireAdmin, getCurrentUser } from "@/lib/auth";
import { TournamentDetailContent } from "@/components/TournamentDetailContent";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ registered?: string; error?: string }>;
};

export default async function TournamentHomePage(props: Props) {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const tournament = await getTournamentBySlug(slug);

  if (!tournament && isUuid(slug)) {
    const byId = await getTournamentById(slug);
    if (byId) {
      redirect(`/t/${encodeSlug(byId.slug)}`);
    }
  }

  if (!tournament) {
    redirect("/tournaments");
  }

  // Check if current user is admin
  const adminResult = await requireAdmin();
  const isAdmin = adminResult.isAdmin;

  // Get current logged in user (for registration)
  const currentUser = await getCurrentUser();
  
  // Check tournament setup status
  const setupStatus = checkTournamentSetupStatus(tournament);

  const participants = await getParticipants(tournament.id);
  const matches = await getMatches(tournament.id);

  const teams = await getTeams(tournament.id);
  const teamMembers = await getTeamMembersByTournament(tournament.id);

  const nameMap = new Map(participants.map((p) => [p.id, p.name]));
  
  // Create a map from participant_id to user_id (for fallback when team_members.user_id is null)
  const participantUserIdMap = new Map(participants.map((p) => [p.id, p.user_id]));
  
  // Fetch user profiles for team members to get avatars
  const teamMemberUserIds = teamMembers
    .map(tm => {
      if (tm.user_id) return tm.user_id;
      if (tm.participant_id) return participantUserIdMap.get(tm.participant_id);
      return null;
    })
    .filter((id): id is string => !!id);
  
  const uniqueUserIds = [...new Set(teamMemberUserIds)];
  const userProfilesMap = await getUserProfiles(uniqueUserIds);
  
  // Build team members map with avatar data
  const teamMembersMap = new Map<string, TeamMemberInfo[]>();
  for (const tm of teamMembers) {
    const members = teamMembersMap.get(tm.team_id) || [];
    const participantName = tm.participant_id ? (nameMap.get(tm.participant_id) || "—") : "—";
    
    const effectiveUserId = tm.user_id || (tm.participant_id ? participantUserIdMap.get(tm.participant_id) : null);
    const userProfile = effectiveUserId ? userProfilesMap.get(effectiveUserId) : null;
    const profileName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}`.trim() : null;
    
    members.push({
      name: profileName || participantName,
      avatarUrl: userProfile?.avatar_url || null,
    });
    teamMembersMap.set(tm.team_id, members);
  }

  return (
    <TournamentDetailContent
      tournament={tournament}
      participants={participants}
      matches={matches}
      teams={teams}
      teamMembersMap={teamMembersMap}
      isAdmin={isAdmin}
      currentUser={currentUser}
      setupStatus={setupStatus}
      searchParams={searchParams}
    />
  );
}
