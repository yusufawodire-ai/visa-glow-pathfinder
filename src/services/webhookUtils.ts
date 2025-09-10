
/**
 * Utility functions for webhook processing
 */

// Mock data for fallback when webhook fails
export const fallbackData = {
  score: "0%",
  overview: "Our system is temporarily unavailable as we perform maintenance. Please try again later to receive your full visa evaluation report.\n\nIn the meantime, you can still connect with our AI Assistant here in the chat to ask questions, receive guidance, and get support for your visa journey. We're here to help you while the service is being restored."
};

/**
 * Parses webhook response from various formats into a standardized structure
 */
export const parseWebhookResponse = (jsonResponse: any) => {
  console.log('Parsing response:', jsonResponse);
  
  // Handle nested output object format { output: { score: string, overview: string } } or { output: [{ score: string, overview: string }] }
  if (jsonResponse && typeof jsonResponse === 'object' && jsonResponse.output) {
    console.log('Processing nested output response:', jsonResponse.output);
    
    // Handle output as array format
    if (Array.isArray(jsonResponse.output) && jsonResponse.output.length > 0) {
      const firstOutput = jsonResponse.output[0];
      if ('score' in firstOutput && 'overview' in firstOutput) {
        return {
          score: firstOutput.score,
          summary: firstOutput.overview
        };
      }
    }
    // Handle output as direct object format
    else if ('score' in jsonResponse.output && 'overview' in jsonResponse.output) {
      return {
        score: jsonResponse.output.score,
        summary: jsonResponse.output.overview
      };
    }
  }
  
  // Handle array format [{ score: string, overview: string }] (new format)
  if (Array.isArray(jsonResponse) && jsonResponse.length > 0) {
    const firstResult = jsonResponse[0];
    console.log('Processing array response, first item:', firstResult);
    
    // Check for direct properties (new format)
    if ('score' in firstResult && 'overview' in firstResult) {
      return {
        score: firstResult.score,
        summary: firstResult.overview
      };
    }
    
    // Check for nested output object (legacy format)
    if (firstResult.output && 'score' in firstResult.output && 'overview' in firstResult.output) {
      return {
        score: firstResult.output.score,
        summary: firstResult.output.overview
      };
    }
    
    // Check for legacy direct properties with summary field
    if ('score' in firstResult) {
      return {
        score: firstResult.score,
        summary: firstResult.summary || firstResult.overview || ''
      };
    } else {
      console.error('Invalid response structure in array:', jsonResponse);
      throw new Error('Invalid response structure in array');
    }
  }
  // Handle direct object format { score: string|number, summary/overview: string }
  else if (jsonResponse && typeof jsonResponse === 'object' && 'score' in jsonResponse) {
    console.log('Processing object response:', jsonResponse);
    
    return {
      score: jsonResponse.score,
      summary: jsonResponse.summary || jsonResponse.overview || ''
    };
  } 
  // Invalid format
  else {
    console.error('Invalid response structure:', jsonResponse);
    throw new Error('Response does not match expected format');
  }
};

/**
 * Converts score to a numeric format removing percentage sign if needed
 */
export const normalizeScore = (score: string | number): number => {
  if (typeof score === 'string') {
    // Remove percentage sign and convert to number
    const normalizedScore = parseFloat(score.replace('%', ''));
    console.log('Converted score string to number:', score, '->', normalizedScore);
    return normalizedScore;
  }
  return score as number;
};

/**
 * Prepare form data from user input
 */
export const prepareFormData = (data: {
  name: string;
  email: string;
  phone?: string;
  visaType: string;
  files: File[];
  link?: string;
}): FormData => {
  const { name, email, phone, visaType, files, link } = data;
  const formData = new FormData();
  
  formData.append('name', name);
  formData.append('email', email);
  if (phone) formData.append('phoneNumber', phone);
  formData.append('visaType', visaType);
  files.forEach(file => formData.append('files', file));
  if (link) formData.append('link', link);
  
  return formData;
};

/**
 * Simulates a webhook response for local testing
 * This is useful for debugging without making actual API calls
 */
export const simulateWebhookResponse = (name: string, email: string, phone: string | undefined, visaType: string) => {
  console.log('Simulating webhook response for:', { name, email, phone, visaType });
  
  const mockResponse = [
    {
      output: {
        score: "87%",
        overview: `Your ${visaType} visa application shows strong potential with a score of 87%. Based on your submitted documents, you have exceptional qualifications in your field. We recommend proceeding with your application with confidence.`
      }
    }
  ];
  
  return {
    evaluationId: "simulated-" + Math.random().toString(36).substring(2, 15),
    score: mockResponse[0].output.score,
    overview: mockResponse[0].output.overview
  };
};

/**
 * Creates a response object with consistent structure
 */
export const createResultObject = (
  evaluationId: string | undefined, 
  score: string | number, 
  overview: string
) => {
  const resultObj = {
    evaluationId,
    score,
    overview
  };
  console.log('Final return object:', resultObj);
  return resultObj;
};
