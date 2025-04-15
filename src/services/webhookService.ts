
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

// Mock data for fallback when webhook fails
const fallbackData: WebhookResponse = {
  score: "75%",
  overview: "This is a fallback evaluation generated because the webhook service is currently unavailable. Your application shows moderate strengths but could be improved in key areas. We recommend consulting with an immigration specialist for personalized guidance."
};

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
    // For debugging on local env, you can uncomment this to skip the actual API call
    // console.log('DEBUG MODE: Simulating webhook response');
    // return simulateWebhookResponse(name, email, phone, visaType);
    
    // Add a timeout to the fetch call to prevent hanging indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    console.log('Webhook URL:', 'https://igta.app.n8n.cloud/webhook-test/DETAILS_SUBMISSION_WEBHOOK');
    const response = await fetch('https://igta.app.n8n.cloud/webhook-test/DETAILS_SUBMISSION_WEBHOOK', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('Webhook response status:', response.status);
    
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const rawResponse = await response.text();
    console.log('Raw webhook response:', rawResponse);
    
    // Handle empty response
    if (!rawResponse || rawResponse.trim() === '') {
      console.log('Empty response from webhook, using fallback data');
      
      // Store fallback data in database
      const scoreValue = parseFloat(fallbackData.score.toString().replace('%', ''));
      
      const storedResult = await storeEvaluationResult({
        name,
        email,
        phone: phone || undefined,
        visa_type: visaType,
        score: scoreValue,
        overview: fallbackData.overview || '',
        user_id: crypto.randomUUID(),
      });
      
      console.log('Stored fallback evaluation result:', storedResult);
      
      return {
        evaluationId: storedResult?.id,
        score: fallbackData.score,
        overview: fallbackData.overview
      };
    }
    
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(rawResponse);
      console.log('Parsed webhook response:', jsonResponse);
    } catch (parseError) {
      console.error('Error parsing webhook response:', parseError, 'Raw response:', rawResponse);
      
      // Use fallback data on parse error too
      console.log('Using fallback data due to parse error');
      
      // Store fallback data in database
      const scoreValue = parseFloat(fallbackData.score.toString().replace('%', ''));
      
      const storedResult = await storeEvaluationResult({
        name,
        email,
        phone: phone || undefined,
        visa_type: visaType,
        score: scoreValue,
        overview: fallbackData.overview || '',
        user_id: crypto.randomUUID(),
      });
      
      console.log('Stored fallback evaluation result:', storedResult);
      
      return {
        evaluationId: storedResult?.id,
        score: fallbackData.score,
        overview: fallbackData.overview
      };
    }
    
    // Extract the evaluation result based on the expected format
    let evaluationResult: WebhookResponse;
    
    if (Array.isArray(jsonResponse) && jsonResponse.length > 0) {
      // Handle array format [{ score: string|number, summary: string }]
      const firstResult = jsonResponse[0];
      console.log('Processing array response, first item:', firstResult);
      
      if ('score' in firstResult) {
        evaluationResult = {
          score: firstResult.score,
          summary: firstResult.summary || firstResult.overview || ''
        };
        console.log('Successfully extracted from array format:', evaluationResult);
      } else {
        console.error('Invalid response structure in array:', jsonResponse);
        throw new Error('Invalid response structure in array');
      }
    } else if (jsonResponse && typeof jsonResponse === 'object' && 'score' in jsonResponse) {
      // Handle direct object format { score: string|number, summary: string }
      console.log('Processing object response:', jsonResponse);
      
      evaluationResult = {
        score: jsonResponse.score,
        summary: jsonResponse.summary || jsonResponse.overview || ''
      };
      console.log('Successfully extracted from object format:', evaluationResult);
    } else {
      console.error('Invalid response structure:', jsonResponse);
      throw new Error('Response does not match expected format { score: string|number, summary|overview: string }');
    }
    
    console.log('Final extracted evaluation result:', evaluationResult);
    
    // Convert score to number if it's a string with percentage
    let scoreValue: number;
    if (typeof evaluationResult.score === 'string') {
      // Remove percentage sign and convert to number
      scoreValue = parseFloat(evaluationResult.score.replace('%', ''));
      console.log('Converted score string to number:', evaluationResult.score, '->', scoreValue);
    } else {
      scoreValue = evaluationResult.score as number;
    }
    
    if (isNaN(scoreValue)) {
      console.error('Invalid score value:', evaluationResult.score);
      throw new Error('Invalid score value');
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
    
    // Ensure we're returning a consistent object structure
    const resultObj = {
      evaluationId: storedResult?.id,
      score: evaluationResult.score,
      overview: evaluationResult.summary || evaluationResult.overview || ''
    };
    
    console.log('Final return object:', resultObj);
    return resultObj;
  } catch (error) {
    console.error('Error in submitEvaluationData:', error);
    
    // Use fallback data on any error to ensure the user can proceed to the results page
    console.log('Using fallback data due to error');
    
    // Store fallback data in database
    const scoreValue = parseFloat(fallbackData.score.toString().replace('%', ''));
    
    try {
      const storedResult = await storeEvaluationResult({
        name,
        email,
        phone: phone || undefined,
        visa_type: visaType,
        score: scoreValue,
        overview: fallbackData.overview || '',
        user_id: crypto.randomUUID(),
      });
      
      console.log('Stored fallback evaluation result:', storedResult);
      
      return {
        evaluationId: storedResult?.id,
        score: fallbackData.score,
        overview: fallbackData.overview
      };
    } catch (dbError) {
      console.error('Error storing fallback result:', dbError);
      
      // Last resort fallback that doesn't require database
      return {
        score: fallbackData.score,
        overview: fallbackData.overview
      };
    }
  }
};

// Debugging function to simulate webhook response without making actual API call
// Uncomment and use for local testing if needed
/*
function simulateWebhookResponse(name: string, email: string, phone: string | undefined, visaType: string) {
  console.log('Simulating webhook response for:', { name, email, phone, visaType });
  
  const mockResponse = [
    {
      score: "87%",
      overview: `Your ${visaType} visa application shows strong potential with a score of 87%. Based on your submitted documents, you have exceptional qualifications in your field. We recommend proceeding with your application with confidence.`
    }
  ];
  
  return {
    evaluationId: "simulated-" + Math.random().toString(36).substring(2, 15),
    score: mockResponse[0].score,
    overview: mockResponse[0].overview
  };
}
*/

