
import { storeEvaluationResult } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { 
  fallbackData,
  parseWebhookResponse,
  normalizeScore,
  prepareFormData,
  createResultObject
} from './webhookUtils';

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

/**
 * Handles the processing of the webhook request
 * @returns The evaluation result
 */
async function processWebhookRequest(
  formData: FormData, 
  userData: { name: string; email: string; phone?: string; visaType: string }
) {
  const { name, email, phone, visaType } = userData;
  
  try {
    // Convert FormData to a format that can be sent through our secure edge function
    const formDataObject: any = {};
    const files: any[] = [];
    
    // Extract form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Convert file to base64
        const arrayBuffer = await value.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const binaryString = Array.from(uint8Array)
          .map(byte => String.fromCharCode(byte))
          .join('');
        const base64Data = btoa(binaryString);
        
        files.push({
          name: value.name,
          type: value.type,
          data: base64Data
        });
      } else {
        formDataObject[key] = value;
      }
    }
    
    // Add files to the form data object
    if (files.length > 0) {
      formDataObject.files = files;
    }
    
    console.log('Sending secure webhook request for evaluation submission');
    
    // Use our secure edge function to proxy the request
    const { data: rawResponse, error } = await supabase.functions.invoke('secure-webhook', {
      body: {
        webhookUrl: 'https://igta.app.n8n.cloud/webhook/DEV-ENVIRONMENT',
        method: 'POST',
        body: formDataObject,
        isFormData: true
      }
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Secure webhook call failed: ${error.message}`);
    }
    console.log('Raw webhook response:', rawResponse);
    
    // Handle empty response
    if (!rawResponse || (typeof rawResponse === 'string' && rawResponse.trim() === '') || (typeof rawResponse === 'object' && Object.keys(rawResponse).length === 0)) {
      return handleEmptyResponse(name, email, phone, visaType);
    }
    
    let jsonResponse;
    try {
      // The edge function returns the webhook response, check if it needs parsing
      jsonResponse = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;
      console.log('Parsed webhook response:', jsonResponse);
    } catch (parseError) {
      console.error('Error parsing webhook response:', parseError, 'Raw response:', rawResponse);
      return handleEmptyResponse(name, email, phone, visaType);
    }
    
    // Parse the response into a standardized format
    const evaluationResult = parseWebhookResponse(jsonResponse);
    console.log('Final extracted evaluation result:', evaluationResult);
    
    // Convert score to number
    const scoreValue = normalizeScore(evaluationResult.score);
    
    if (isNaN(scoreValue)) {
      console.error('Invalid score value:', evaluationResult.score);
      throw new Error('Invalid score value');
    }
    
    // Store the result in the database
    const storedResult = await storeEvaluationResult({
      name,
      email,
      phone: phone || undefined,
      visa_type: visaType,
      score: scoreValue,
      overview: evaluationResult.summary || '',
      user_id: crypto.randomUUID(),
    });
    
    console.log('Stored evaluation result:', storedResult);
    
    // Return a consistently structured object
    return createResultObject(
      storedResult?.id,
      evaluationResult.score,
      evaluationResult.summary || ''
    );
  } catch (error) {
    throw error; // Let the main function handle errors
  }
}

/**
 * Handles the case when the webhook response is empty or cannot be parsed
 */
async function handleEmptyResponse(name: string, email: string, phone: string | undefined, visaType: string) {
  console.log('Empty response from webhook, using fallback data');
  
  // Store fallback data in database
  const scoreValue = normalizeScore(fallbackData.score);
  
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
  
  return createResultObject(
    storedResult?.id,
    fallbackData.score,
    fallbackData.overview || ''
  );
}

/**
 * Handles storing fallback data when an error occurs
 */
async function handleErrorWithFallback(
  error: unknown, 
  name: string, 
  email: string, 
  phone: string | undefined, 
  visaType: string
) {
  console.log('Using fallback data due to error');
  
  // Store fallback data in database
  const scoreValue = normalizeScore(fallbackData.score);
  
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
    
    return createResultObject(
      storedResult?.id,
      fallbackData.score,
      fallbackData.overview || ''
    );
  } catch (dbError) {
    console.error('Error storing fallback result:', dbError);
    
    // Last resort fallback that doesn't require database
    return createResultObject(
      undefined,
      fallbackData.score,
      fallbackData.overview || ''
    );
  }
}

/**
 * Main function to submit evaluation data and get results
 */
export const submitEvaluationData = async (data: EvaluationResultData) => {
  const { name, email, phone, visaType, files, link } = data;
  
  // Prepare form data
  const formData = prepareFormData(data);
  
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
    
    return await processWebhookRequest(formData, { name, email, phone, visaType });
  } catch (error) {
    console.error('Error in submitEvaluationData:', error);
    return handleErrorWithFallback(error, name, email, phone, visaType);
  }
};
