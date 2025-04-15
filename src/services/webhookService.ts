
import { storeEvaluationResult } from '@/lib/supabase';

export interface EvaluationResultData {
  name: string;
  email: string;
  phone?: string;
  visaType: string;
  files: File[];
  link?: string;
}

export interface WebhookResponse {
  score: number;
  overview: string;
}

export const submitEvaluationData = async (data: EvaluationResultData) => {
  const { name, email, phone, visaType, files, link } = data;
  
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  if (phone) formData.append('phoneNumber', phone);
  formData.append('visaType', visaType);
  files.forEach(file => formData.append('files', file));
  if (link) formData.append('link', link);
  
  console.log('Submitting form data', { 
    name, 
    email, 
    phone, 
    visaType, 
    filesCount: files.length, 
    link 
  });
  
  try {
    console.log('Sending data to webhook...');
    const response = await fetch('https://igta.app.n8n.cloud/webhook/DETAILS_SUBMISSION_WEBHOOK', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      throw new Error(`Server returned error ${response.status}: ${response.statusText}`);
    }
    
    const rawResponse = await response.text();
    console.log('Raw webhook response:', rawResponse);
    
    if (!rawResponse || rawResponse.trim() === '') {
      throw new Error('Server returned empty response');
    }
    
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(rawResponse);
      console.log('Parsed webhook response:', jsonResponse);
    } catch (parseError) {
      console.error('Error parsing webhook response:', parseError, 'Raw response:', rawResponse);
      throw new Error('Invalid JSON response from webhook');
    }
    
    let evaluationResult: WebhookResponse | null = null;
    
    // Expected format: {"score": number, "overview": string} or [{"score": number, "overview": string}]
    if (Array.isArray(jsonResponse) && jsonResponse.length > 0 && 
        'score' in jsonResponse[0] && 'overview' in jsonResponse[0]) {
      // Handle array format
      evaluationResult = jsonResponse[0];
    } else if ('score' in jsonResponse && 'overview' in jsonResponse) {
      // Handle direct object format
      evaluationResult = jsonResponse;
    } else {
      console.error('Invalid response structure:', jsonResponse);
      throw new Error('Expected webhook response format: {"score": number, "overview": string}');
    }
    
    console.log('Extracted evaluation result:', evaluationResult);
    
    if (!evaluationResult || typeof evaluationResult.score !== 'number' || !evaluationResult.overview) {
      console.error('Missing or invalid score/overview in evaluation result:', evaluationResult);
      throw new Error('Missing or invalid required fields in evaluation result');
    }
    
    const storedResult = await storeEvaluationResult({
      name,
      email,
      phone: phone || undefined,
      visa_type: visaType,
      score: evaluationResult.score,
      overview: evaluationResult.overview,
      user_id: crypto.randomUUID(), // Generate a random ID for anonymous users
    });
    
    console.log('Stored evaluation result:', storedResult);
    
    return {
      evaluationId: storedResult?.id,
      score: evaluationResult.score,
      overview: evaluationResult.overview
    };
  } catch (error) {
    console.error('Error in evaluation submission:', error);
    throw error; // Re-throw to be handled by the UI
  }
};
