-- Migration: Make teams.created_by nullable for public registration support
-- Public registrations don't have authenticated users yet, so created_by should be nullable

-- Remove NOT NULL constraint from created_by
ALTER TABLE teams 
ALTER COLUMN created_by DROP NOT NULL;

-- Add comment explaining nullable created_by
COMMENT ON COLUMN teams.created_by IS 'User ID who created the team. NULL for public registrations before user account creation.';

-- Note: When a user later authenticates, we can update created_by to link the team to their account
