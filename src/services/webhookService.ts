
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
  score: string | number;
  summary?: string;
  overview?: string; // Keep for backward compatibility
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
  
  console.log('Sending data to webhook...');
  try {
    const response = await fetch('https://igta.app.n8n.cloud/webhook-test/DETAILS_SUBMISSION_WEBHOOK', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const rawResponse = await response.text();
    console.log('Raw webhook response:', rawResponse);
    
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(rawResponse);
      console.log('Parsed webhook response:', jsonResponse);
    } catch (parseError) {
      console.error('Error parsing webhook response:', parseError, 'Raw response:', rawResponse);
      throw new Error('Invalid JSON response from webhook');
    }
    
    // Extract the evaluation result based on the expected format
    let evaluationResult: WebhookResponse;
    
    if (Array.isArray(jsonResponse) && jsonResponse.length > 0) {
      // Handle array format [{ score: string|number, summary: string }]
      const firstResult = jsonResponse[0];
      if ('score' in firstResult && ('summary' in firstResult || 'overview' in firstResult)) {
        evaluationResult = {
          score: firstResult.score,
          summary: firstResult.summary || firstResult.overview
        };
      } else {
        throw new Error('Invalid response structure in array');
      }
    } else if ('score' in jsonResponse && ('summary' in jsonResponse || 'overview' in jsonResponse)) {
      // Handle direct object format { score: string|number, summary: string }
      evaluationResult = {
        score: jsonResponse.score,
        summary: jsonResponse.summary || jsonResponse.overview
      };
    } else {
      console.error('Invalid response structure:', jsonResponse);
      throw new Error('Response does not match expected format { score: string|number, summary|overview: string }');
    }
    
    console.log('Extracted evaluation result:', evaluationResult);
    
    // Convert score to number if it's a string with percentage
    let scoreValue: number;
    if (typeof evaluationResult.score === 'string') {
      // Remove percentage sign and convert to number
      scoreValue = parseFloat(evaluationResult.score.replace('%', ''));
    } else {
      scoreValue = evaluationResult.score as number;
    }
    
    if (isNaN(scoreValue) || (!evaluationResult.summary && !evaluationResult.overview)) {
      console.error('Invalid types in evaluation result:', evaluationResult);
      throw new Error('Invalid data types in evaluation result');
    }
    
    const storedResult = await storeEvaluationResult({
      name,
      email,
      phone: phone || undefined,
      visa_type: visaType,
      score: scoreValue,
      overview: evaluationResult.summary || evaluationResult.overview || '',
      user_id: crypto.randomUUID(), // Generate a random ID for anonymous users
    });
    
    console.log('Stored evaluation result:', storedResult);
    
    return {
      evaluationId: storedResult?.id,
      score: evaluationResult.score,
      overview: evaluationResult.summary || evaluationResult.overview
    };
  } catch (error) {
    console.error('Error in submitEvaluationData:', error);
    throw error; // Re-throw to be handled by the caller
  }
};
