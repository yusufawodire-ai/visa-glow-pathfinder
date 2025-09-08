import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Secure webhook proxy called');
    
    // Get the API key from environment
    const WEBHOOK_API_KEY = Deno.env.get('WEBHOOK_API_KEY');
    if (!WEBHOOK_API_KEY) {
      console.error('WEBHOOK_API_KEY not found in environment');
      throw new Error('Webhook API key not configured');
    }

    // Parse the request
    const { webhookUrl, method = 'POST', body, isFormData = false } = await req.json();
    
    if (!webhookUrl) {
      throw new Error('Webhook URL is required');
    }

    console.log('Proxying request to:', webhookUrl);
    
    // Prepare headers with API key authentication
    const headers: Record<string, string> = {
      'X-API-Key': WEBHOOK_API_KEY,
    };

    // Handle different body types
    let requestBody;
    if (isFormData) {
      // For form data, we need to reconstruct it
      const formData = new FormData();
      
      if (body && typeof body === 'object') {
        // Add regular form fields
        for (const [key, value] of Object.entries(body)) {
          if (key !== 'files') {
            formData.append(key, String(value));
          }
        }
        
        // Handle files if they exist (they would be base64 encoded)
        if (body.files && Array.isArray(body.files)) {
          for (let i = 0; i < body.files.length; i++) {
            const file = body.files[i];
            if (file.data && file.name) {
              // Convert base64 back to blob
              const binaryString = atob(file.data);
              const bytes = new Uint8Array(binaryString.length);
              for (let j = 0; j < binaryString.length; j++) {
                bytes[j] = binaryString.charCodeAt(j);
              }
              const blob = new Blob([bytes], { type: file.type || 'application/octet-stream' });
              formData.append('files', blob, file.name);
            }
          }
        }
      }
      
      requestBody = formData;
      // Don't set Content-Type for FormData, let the browser set it with boundary
    } else {
      // For JSON data
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }

    // Make the request to the actual webhook with API key
    console.log('Making authenticated request with headers:', Object.keys(headers));
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 100000); // 100 second timeout
    
    const response = await fetch(webhookUrl, {
      method,
      headers,
      body: requestBody,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Webhook response status:', response.status);

    if (!response.ok) {
      console.error(`Webhook HTTP error! Status: ${response.status}`);
      throw new Error(`Webhook HTTP error! Status: ${response.status}`);
    }

    let responseData;

    // Check if this is a streaming endpoint (chat) vs regular endpoint (evaluation)
    const isStreamingEndpoint = webhookUrl.includes('/chat') || webhookUrl.includes('llm-chat');
    
    if (isStreamingEndpoint && response.body) {
      console.log('Detected streaming endpoint, processing stream...');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;
          
          console.log(`Received streaming chunk: ${chunk.substring(0, 100)}...`);
        }

        console.log('Stream processing complete. Accumulated content:', accumulatedContent);

        // Try to extract meaningful content from the stream
        const lines = accumulatedContent.split('\n').filter(line => line.trim());
        let messageContent = '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          // Try to parse as JSON first
          try {
            const jsonData = JSON.parse(trimmedLine);
            console.log(`Parsed JSON data:`, jsonData);
            
            // Extract content from various formats
            if (jsonData.content) {
              messageContent += jsonData.content;
            } else if (jsonData.message) {
              messageContent += jsonData.message;
            } else if (jsonData.response) {
              messageContent += jsonData.response;
            } else if (typeof jsonData === 'string') {
              messageContent += jsonData;
            }
          } catch (e) {
            // Not JSON, treat as plain text
            console.log(`Plain text line: ${trimmedLine}`);
            messageContent += trimmedLine + ' ';
          }
        }

        // Return the accumulated message content
        responseData = messageContent.trim() || accumulatedContent.trim();

      } catch (streamError) {
        console.error('Error reading stream:', streamError);
        responseData = 'Sorry, there was an error processing the streaming response.';
      }
    } else {
      // Non-streaming response (evaluation)
      console.log('Processing non-streaming response...');
      try {
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        responseData = JSON.parse(responseText);
        console.log('Successfully parsed JSON response:', responseData);
      } catch (parseError) {
        console.error('Failed to parse webhook response as JSON:', parseError);
        responseData = responseText || 'No response content received';
      }
    }

    console.log('Final response data being returned:', responseData);

    // Return the parsed response as JSON
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json'
      },
    });

  } catch (error) {
    console.error('Error in secure webhook proxy:', error);
    
    // Return a detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Webhook proxy failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});