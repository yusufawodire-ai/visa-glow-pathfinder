
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a mock Supabase client for when credentials are missing
const createMockClient = () => {
  console.warn('Using mock Supabase client due to missing credentials. Please connect your project to Supabase from the Lovable interface.');
  
  return {
    from: () => ({
      insert: () => ({ 
        select: () => ({
          single: () => Promise.resolve({ 
            data: { 
              id: crypto.randomUUID(),
              created_at: new Date().toISOString()
            }, 
            error: null 
          })
        })
      }),
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      })
    })
  };
};

// Determine if we can create a real client or need to use the mock
export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? createMockClient() as any
  : createClient(supabaseUrl, supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Using local storage fallback for data persistence.');
}

export interface EvaluationResult {
  id?: number;
  created_at?: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  visa_type: string;
  score: number;
  overview: string;
}

export const storeEvaluationResult = async (result: Omit<EvaluationResult, 'id' | 'created_at'>) => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      // Fallback to localStorage when Supabase is not available
      const id = crypto.randomUUID();
      const created_at = new Date().toISOString();
      const storedResult = { ...result, id, created_at };
      
      // Store in sessionStorage for persistence during the session
      const existingResults = JSON.parse(sessionStorage.getItem('evaluationResults') || '[]');
      existingResults.push(storedResult);
      sessionStorage.setItem('evaluationResults', JSON.stringify(existingResults));
      
      console.log('Stored evaluation in sessionStorage:', storedResult);
      return storedResult;
    }
    
    const { data, error } = await supabase
      .from('visa_evaluations')
      .insert(result)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error storing evaluation:', error);
    
    // Even if Supabase fails, still store locally as fallback
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const storedResult = { ...result, id, created_at };
    
    const existingResults = JSON.parse(sessionStorage.getItem('evaluationResults') || '[]');
    existingResults.push(storedResult);
    sessionStorage.setItem('evaluationResults', JSON.stringify(existingResults));
    
    console.log('Fallback: Stored evaluation in sessionStorage:', storedResult);
    return storedResult;
  }
};

export const getEvaluationResult = async (id: string) => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      // Fallback to localStorage when Supabase is not available
      const existingResults = JSON.parse(sessionStorage.getItem('evaluationResults') || '[]');
      const result = existingResults.find((r: any) => r.id === id);
      
      console.log('Retrieved evaluation from sessionStorage:', result);
      return result || null;
    }
    
    const { data, error } = await supabase
      .from('visa_evaluations')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    return data as EvaluationResult;
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    
    // Try to get from sessionStorage as fallback
    const existingResults = JSON.parse(sessionStorage.getItem('evaluationResults') || '[]');
    const result = existingResults.find((r: any) => r.id === id);
    
    console.log('Fallback: Retrieved evaluation from sessionStorage:', result);
    return result || null;
  }
};
