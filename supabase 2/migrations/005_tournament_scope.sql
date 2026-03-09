-- Migration: Tournament-scoped data with NOT NULL constraints and indexes

-- Make tournament_id NOT NULL for participants
ALTER TABLE participants
  ALTER COLUMN tournament_id SET NOT NULL;

-- Make tournament_id NOT NULL for matches
ALTER TABLE matches
  ALTER COLUMN tournament_id SET NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_participants_tournament_id 
  ON participants(tournament_id);

CREATE INDEX IF NOT EXISTS idx_matches_tournament_id 
  ON matches(tournament_id);

CREATE INDEX IF NOT EXISTS idx_matches_tournament_round 
  ON matches(tournament_id, round);

-- Ensure referential integrity constraints are in place
-- (Already set via ON DELETE CASCADE in 001_init.sql, but documenting for clarity)

-- Verify no orphaned records exist before enforcing constraints
-- SELECT COUNT(*) FROM participants WHERE tournament_id IS NULL;
-- SELECT COUNT(*) FROM matches WHERE tournament_id IS NULL;
