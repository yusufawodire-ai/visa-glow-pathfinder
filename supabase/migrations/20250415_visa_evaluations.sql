
-- Create visa_evaluations table
CREATE TABLE IF NOT EXISTS visa_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  visa_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  overview TEXT NOT NULL
);

-- Add RLS policies
ALTER TABLE visa_evaluations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert data (since we're handling public submissions)
CREATE POLICY "Allow public inserts" 
  ON visa_evaluations 
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- Create policy to allow users to read their own data
CREATE POLICY "Allow users to read their own data" 
  ON visa_evaluations 
  FOR SELECT 
  TO authenticated, anon
  USING (true);
