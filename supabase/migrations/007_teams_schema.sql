-- Migration: 007_teams_schema.sql
-- Add teams/team_members tables and players_per_team to tournaments
-- FIFA only supports 1v1 or 2v2 formats

-- Add players_per_team column to tournaments (1 = 1v1, 2 = 2v2)
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS players_per_team integer NOT NULL DEFAULT 1;

-- Constraint: FIFA only supports 1v1 or 2v2
ALTER TABLE tournaments
ADD CONSTRAINT chk_players_per_team CHECK (players_per_team IN (1, 2));

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Team members junction table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(team_id, participant_id)
);

-- Add team references to matches (for team-based matches)
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS home_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS away_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS winner_team_id uuid REFERENCES teams(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Public read team_members" ON team_members
  FOR SELECT USING (true);

-- Admin write policies (service role only)
CREATE POLICY "Admin write teams" ON teams
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admin update teams" ON teams
  FOR UPDATE WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admin delete teams" ON teams
  FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "Admin write team_members" ON team_members
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admin update team_members" ON team_members
  FOR UPDATE WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admin delete team_members" ON team_members
  FOR DELETE USING (auth.role() = 'service_role');

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_teams_tournament ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_participant ON team_members(participant_id);
CREATE INDEX IF NOT EXISTS idx_matches_home_team ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team ON matches(away_team_id);
