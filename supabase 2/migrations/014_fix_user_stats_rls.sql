-- Fix RLS policy for user_stats to allow the trigger to insert stats
-- The trigger create_user_stats runs when a user profile is created,
-- but it needs permission to insert into user_stats

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Service role can manage stats" ON user_stats;

-- Allow users to insert their own stats (needed for trigger)
CREATE POLICY "Users can insert their own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own stats (for future use)
CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Also make the trigger function SECURITY DEFINER so it runs with elevated privileges
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
