-- Fix remaining RLS issues by enabling RLS on all public tables
ALTER TABLE public.document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies for document_metadata table
CREATE POLICY "No public access to document metadata" 
ON public.document_metadata 
FOR ALL 
USING (false);

-- Create restrictive policies for documents table  
CREATE POLICY "No public access to documents" 
ON public.documents 
FOR ALL 
USING (false);