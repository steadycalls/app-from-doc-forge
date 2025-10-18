-- ============================================================================
-- SECURITY FIX: Address linter warnings from previous migration
-- ============================================================================

-- Fix 1: Update function with proper search_path
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix 2: Enable RLS on organizations table with appropriate policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view organizations (needed for login and org detection)
CREATE POLICY "Anyone can view organizations"
  ON organizations FOR SELECT
  USING (true);

-- Only service role can manage organizations (created via seed data)
-- Regular users cannot create/update/delete organizations
CREATE POLICY "Only service role can manage organizations"
  ON organizations FOR ALL
  USING (false)
  WITH CHECK (false);