-- Add team formation mode to tournaments
-- Options: 'preformed' (فرق جاهزة) or 'random_draw' (تشكيل الفرق بالقرعة)
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS team_formation_mode TEXT CHECK (team_formation_mode IN ('preformed', 'random_draw'));

-- Add index for querying by formation mode
CREATE INDEX IF NOT EXISTS idx_tournaments_formation_mode 
  ON tournaments(team_formation_mode) 
  WHERE team_formation_mode IS NOT NULL;

-- Add comment
COMMENT ON COLUMN tournaments.team_formation_mode IS 'How teams are formed: preformed (teams register together) or random_draw (players paired randomly)';

-- For 2v2 tournaments, team_formation_mode should be set
-- For 1v1 tournaments, it should be NULL
