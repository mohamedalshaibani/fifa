-- Add team_name to participants table for team-based tournaments
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS team_name TEXT,
ADD COLUMN IF NOT EXISTS is_team_registration BOOLEAN DEFAULT false;

-- Add index for team lookups
CREATE INDEX IF NOT EXISTS idx_participants_team_name 
  ON participants(tournament_id, team_name) 
  WHERE team_name IS NOT NULL;

-- Add comment
COMMENT ON COLUMN participants.team_name IS 'Team name for 2v2 tournaments';
COMMENT ON COLUMN participants.is_team_registration IS 'True if this is the primary registration for a team (first player)';
