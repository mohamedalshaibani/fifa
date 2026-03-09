-- Add is_active column to tournaments table for tracking which tournament is active
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tournaments_is_active ON tournaments(is_active);
CREATE INDEX IF NOT EXISTS idx_tournaments_created_at ON tournaments(created_at DESC);
