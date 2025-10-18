-- Security Fix: Remove public access to organizations table
-- This addresses the PUBLIC_ORGANIZATION_DATA security finding

-- Drop the existing public policy that allows anyone to view organizations
DROP POLICY IF EXISTS "Anyone can view organizations" ON public.organizations;

-- Create a new policy that restricts access to authenticated users who are members of the organization
CREATE POLICY "Users can view their organizations"
ON public.organizations
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM public.user_organizations 
    WHERE organization_id = organizations.id
  )
);

-- Add policy for inserting organizations (only authenticated users)
CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add policy for updating organizations (only org members)
CREATE POLICY "Organization members can update their organization"
ON public.organizations
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM public.user_organizations 
    WHERE organization_id = organizations.id
  )
);