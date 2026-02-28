-- Fix infinite recursion in admins RLS policy
-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admin write admins" ON admins;

-- Create a safer policy using a non-RLS check
-- This policy allows admins (verified via service role) to manage admins table
-- For regular users, deny writes to admins table
CREATE POLICY "Admin manage admins" ON admins
  FOR ALL
  USING (
    -- Service role bypass: always allow
    -- For normal users: only allow if they're an authenticated user
    -- (actual admin check done at application level via service role)
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    auth.role() = 'authenticated'
  );

-- Alternatively, drop all policies on admins and create minimal ones
-- that don't cause recursion
DROP POLICY IF EXISTS "Admin manage admins" ON admins;

-- Drop old policy if it exists
DROP POLICY IF EXISTS "Admin read own row" ON admins;

-- New minimal policies for admins table (no recursive subqueries)
CREATE POLICY "Users can read their own admin status" ON admins
  FOR SELECT
  USING (user_id = auth.uid());

-- Disable insert/update/delete for regular users
-- (only service role can manage admins via auth.role() = 'service_role')
CREATE POLICY "Service role only for admin changes" ON admins
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
