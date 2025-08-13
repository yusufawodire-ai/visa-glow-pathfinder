-- Enable Row Level Security on n8n_chat_histories table
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own chat history based on session
-- This assumes session_id is tied to user sessions and should be restricted
CREATE POLICY "Users can view their own chat history" 
ON public.n8n_chat_histories 
FOR SELECT 
USING (
  -- Only allow access if the session_id matches the current user's session
  -- For now, we'll use a more restrictive approach - no public access
  false
);

-- Create policy to allow inserting new chat messages 
-- This is needed for the webhook functionality to work
CREATE POLICY "Allow chat message inserts" 
ON public.n8n_chat_histories 
FOR INSERT 
WITH CHECK (true);

-- Note: For a more secure implementation, you should:
-- 1. Add a user_id column to link chat sessions to authenticated users
-- 2. Update the policies to use auth.uid() for proper user-based access control
-- 3. Modify the application to store user_id when creating chat sessions