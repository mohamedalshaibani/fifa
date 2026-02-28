-- Enable public registration for all existing tournaments
UPDATE tournaments
SET allow_public_registration = true
WHERE allow_public_registration = false OR allow_public_registration IS NULL;

-- Set default to true for future tournaments
ALTER TABLE tournaments
ALTER COLUMN allow_public_registration SET DEFAULT true;
