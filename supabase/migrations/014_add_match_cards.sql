-- Add yellow and red card columns to matches table
-- These are stored per match, and can be used for tie-breaking calculations

-- For individual (1v1) tournaments: cards are per player
-- For team (2v2) tournaments: cards are per team (aggregate)

-- Home side cards
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_yellow_cards int DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_red_cards int DEFAULT 0;

-- Away side cards
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_yellow_cards int DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_red_cards int DEFAULT 0;

-- Add index for efficient queries when calculating standings
CREATE INDEX IF NOT EXISTS idx_matches_cards ON matches (tournament_id, home_yellow_cards, home_red_cards, away_yellow_cards, away_red_cards);

COMMENT ON COLUMN matches.home_yellow_cards IS 'Number of yellow cards received by home player/team';
COMMENT ON COLUMN matches.home_red_cards IS 'Number of red cards received by home player/team';
COMMENT ON COLUMN matches.away_yellow_cards IS 'Number of yellow cards received by away player/team';
COMMENT ON COLUMN matches.away_red_cards IS 'Number of red cards received by away player/team';
