
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Please connect your project to Supabase from the Lovable interface.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      console.warn('Supabase credentials not available. Skipping database storage.');
      return null;
    }
    
    const { data, error } = await supabase
      .from('visa_evaluations')
      .insert(result)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error storing evaluation in Supabase:', error);
    return null;
  }
};

export const getEvaluationResult = async (id: string) => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not available. Skipping database fetch.');
      return null;
    }
    
    const { data, error } = await supabase
      .from('visa_evaluations')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    return data as EvaluationResult;
  } catch (error) {
    console.error('Error fetching evaluation from Supabase:', error);
    return null;
  }
};
