-- Emergency fix for infinite recursion in admins table RLS
-- This migration removes all problematic policies and creates safe, non-recursive ones

-- First, disable RLS temporarily to remove policies
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on admins
DROP POLICY IF EXISTS "Admin write admins" ON admins;
DROP POLICY IF EXISTS "Admin manage admins" ON admins;
DROP POLICY IF EXISTS "Admin read own row" ON admins;
DROP POLICY IF EXISTS "Service role only for admin changes" ON admins;
DROP POLICY IF EXISTS "Users can read their own admin status" ON admins;

-- Re-enable RLS with clean slate
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- CREATE MINIMAL, NON-RECURSIVE POLICIES

-- Policy 1: Everyone (anon/authenticated) can check if a specific user is admin
-- This should NOT be blocked - it's needed for public queries to work
CREATE POLICY "Anyone can read admins (no recursion)" ON admins
  FOR SELECT
  USING (true);

-- Policy 2: Only service role can insert/update/delete admins
CREATE POLICY "Service role only writes admins" ON admins
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only updates admins" ON admins
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only deletes admins" ON admins
  FOR DELETE
  USING (auth.role() = 'service_role');

