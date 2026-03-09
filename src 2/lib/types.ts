export type TournamentStatus =
  | "registration_open"
  | "registration_closed"
  | "running"
  | "pending"
  | "finished";

export type TournamentType = "league" | "knockout" | null;

export type Tournament = {
  id: string;
  slug: string;
  name: string;
  type: TournamentType;
  status: TournamentStatus;
  allow_public_registration: boolean;
  players_per_team: number;
  team_formation_mode?: "preformed" | "random_draw" | null;
  is_public: boolean;
  start_date?: string | null;
  created_at: string;
};

export type Participant = {
  id: string;
  tournament_id: string;
  user_id: string; // Always linked to a user account
  team_id?: string | null; // For team tournaments
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  registration_status?: "pending" | "approved" | "rejected" | null;
  approved_at?: string | null;
  created_at: string;
};

export type Team = {
  id: string;
  tournament_id: string;
  name: string | null;
  created_by: string; // User ID who created the team
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string; // Linked to user account
  participant_id?: string | null;
  role: "creator" | "member";
  status: "pending" | "confirmed" | "declined";
  joined_at: string;
};

export type TeamInvitation = {
  id: string;
  team_id: string;
  tournament_id: string;
  inviter_id: string;
  invitee_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  responded_at?: string | null;
};

export type MatchStatus = "scheduled" | "completed";

export type Match = {
  id: string;
  tournament_id: string;
  round: number;
  home_participant_id: string | null;
  away_participant_id: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  home_user_id: string | null; // Individual user for 1v1
  away_user_id: string | null; // Individual user for 1v1
  home_score: number | null;
  away_score: number | null;
  winner_participant_id: string | null;
  winner_team_id: string | null;
  winner_user_id: string | null; // Winner is always a user
  status: MatchStatus | string;
  created_at: string;
};

export type Pairing = {
  id: string;
  tournament_id: string;
  home_participant_id: string;
  away_participant_id: string | null;
  created_at: string;
};

export type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  whatsapp_number: string;
  email: string;
  avatar_url?: string | null;
  avatar_id?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
};

export type UserStats = {
  id: string;
  user_id: string;
  tournaments_joined: number;
  matches_played: number;
  wins: number;
  losses: number;
  draws: number;
  goals_scored: number;
  goals_against: number;
  created_at: string;
  updated_at: string;
};

export type Avatar = {
  id: string;
  name: string;
  display_name: string;
  description?: string | null;
  image_url: string;
  category: string;
  created_at: string;
};
