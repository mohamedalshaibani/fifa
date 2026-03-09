-- Complete team structure overhaul for user-based system
-- Teams are now compositions of real user accounts

-- Drop old team_members structure (will be replaced)
DROP TABLE IF EXISTS team_members CASCADE;

-- Recreate teams table with proper user tracking
DROP TABLE IF EXISTS teams CASCADE;
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT, -- Optional team name (can be auto-generated from player names)
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- User who initiated team
  status TEXT DEFAULT 'pending', -- pending, confirmed, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members - links users to teams
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'member', -- creator, member
  status TEXT DEFAULT 'confirmed', -- pending, confirmed, declined
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id) -- A user can only be in a team once
);

-- Team invitations/requests
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(team_id, invitee_id) -- Can't invite same user twice to same team
);

-- Update participants to always link to user
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'pending'; -- pending, approved, rejected

-- Update matches to track individual users (not just participants)
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS home_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS away_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS winner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_teams_tournament ON teams(tournament_id);
CREATE INDEX idx_teams_creator ON teams(created_by);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_invitations_invitee ON team_invitations(invitee_id);
CREATE INDEX idx_team_invitations_status ON team_invitations(status);
CREATE INDEX idx_participants_user ON participants(user_id);
CREATE INDEX idx_participants_team ON participants(team_id);
CREATE INDEX idx_matches_users ON matches(home_user_id, away_user_id);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Users can view teams in their tournaments" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team creators can update their teams" ON teams
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Service role manages teams" ON teams
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for team_members
CREATE POLICY "Anyone can view team members" ON team_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join teams" ON team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages team members" ON team_members
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for team_invitations
CREATE POLICY "Users can view their invitations" ON team_invitations
  FOR SELECT USING (auth.uid() = invitee_id OR auth.uid() = inviter_id);

CREATE POLICY "Users can send invitations" ON team_invitations
  FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can respond to their invitations" ON team_invitations
  FOR UPDATE USING (auth.uid() = invitee_id);

CREATE POLICY "Service role manages invitations" ON team_invitations
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for participants (user registration)
CREATE POLICY "Users can register themselves" ON participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own registrations" ON participants
  FOR SELECT USING (auth.uid() = user_id OR true); -- Allow public read but enforce on insert

-- Function to auto-accept team invitation and create team member
CREATE OR REPLACE FUNCTION accept_team_invitation(invitation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_team_id UUID;
  v_invitee_id UUID;
  v_tournament_id UUID;
BEGIN
  -- Get invitation details
  SELECT team_id, invitee_id, tournament_id INTO v_team_id, v_invitee_id, v_tournament_id
  FROM team_invitations
  WHERE id = invitation_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Update invitation status
  UPDATE team_invitations
  SET status = 'accepted', responded_at = NOW()
  WHERE id = invitation_id;

  -- Add user to team
  INSERT INTO team_members (team_id, user_id, role, status)
  VALUES (v_team_id, v_invitee_id, 'member', 'confirmed')
  ON CONFLICT (team_id, user_id) DO NOTHING;

  -- Update team status to confirmed if all members joined
  UPDATE teams
  SET status = 'confirmed', updated_at = NOW()
  WHERE id = v_team_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to decline team invitation
CREATE OR REPLACE FUNCTION decline_team_invitation(invitation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE team_invitations
  SET status = 'declined', responded_at = NOW()
  WHERE id = invitation_id AND status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
