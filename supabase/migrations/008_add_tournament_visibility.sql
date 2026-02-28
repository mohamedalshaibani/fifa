-- Add visibility column to tournaments table
ALTER TABLE tournaments 
ADD COLUMN is_public BOOLEAN DEFAULT true;

-- Create index for faster queries on public tournaments
CREATE INDEX idx_tournaments_public ON tournaments(is_public) WHERE is_public = true;

-- Update existing tournaments to be public by default
UPDATE tournaments SET is_public = true WHERE is_public IS NULL;