-- Fix the overly permissive SELECT policy on visa_evaluations table
-- Remove the current policy that allows anyone to read all records
DROP POLICY IF EXISTS "Allow users to read their own data" ON public.visa_evaluations;

-- Create a restrictive policy that blocks all SELECT access until proper authentication is implemented
-- This prevents the personal information exposure vulnerability
CREATE POLICY "Restrict all data access until authentication" 
ON public.visa_evaluations 
FOR SELECT 
USING (false);

-- Note: Once authentication is implemented, this policy should be updated to:
-- USING (auth.uid()::text = user_id)
-- This will ensure users can only access their own evaluation records