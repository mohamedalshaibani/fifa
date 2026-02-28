-- Migration: Make team_members.user_id nullable for public registration support
-- Public registrations link participants to teams before user accounts exist

-- Remove NOT NULL constraint from user_id
ALTER TABLE team_members 
ALTER COLUMN user_id DROP NOT NULL;

-- Add comment explaining nullable user_id
COMMENT ON COLUMN team_members.user_id IS 'User ID of the team member. NULL for public registrations before user account creation. Populated from participant when user_id is available.';

-- Note: When participants authenticate later, we can populate user_id from participants.user_id
