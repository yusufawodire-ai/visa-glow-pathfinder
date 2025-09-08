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

    // Get the response
    const responseText = await response.text();
    console.log('Webhook response received, length:', responseText.length);
    console.log('Full webhook response text:', responseText);

    // Handle streaming responses - extract the actual message content, not just metadata
    let responseData;
    if (responseText.includes('\n') || responseText.includes('}{')) {
      console.log('Detected streaming response, extracting message content');
      
      // Split by newlines and find message content (not just metadata)
      const lines = responseText.split('\n').filter(line => line.trim());
      console.log('Found', lines.length, 'lines in stream');
      let messageContent = null;
      let allJsonData = [];
      
      // Parse all JSON objects in the stream
      for (let i = 0; i < lines.length; i++) {
        try {
          const parsed = JSON.parse(lines[i]);
          allJsonData.push(parsed);
          console.log(`Line ${i}:`, parsed);
          
          // Look for actual message content (not just metadata or end events)
          if (parsed.message || parsed.output || parsed.response || parsed.content) {
            messageContent = parsed;
            console.log('Found message content in line', i, ':', messageContent);
          } else if (parsed.type !== 'end' && parsed.type !== 'start' && !parsed.metadata) {
            // If it's not an end/start event and doesn't contain just metadata, it might be content
            messageContent = parsed;
            console.log('Found potential content in line', i, ':', messageContent);
          }
        } catch (e) {
          console.log('Could not parse line', i, 'as JSON:', lines[i]);
          continue;
        }
      }
      
      console.log('Total JSON objects found:', allJsonData.length);
      console.log('Message content found:', messageContent);
      
      // If we found message content, use it
      if (messageContent) {
        console.log('Successfully extracted message content from stream:', messageContent);
        responseData = messageContent;
      } else if (allJsonData.length > 0) {
        // If no explicit message content found, look for the last non-metadata object
        const contentEvents = allJsonData.filter(obj => 
          obj.type !== 'end' && 
          obj.type !== 'start' && 
          !obj.metadata &&
          (obj.message || obj.output || obj.response || obj.content || typeof obj === 'string')
        );
        
        console.log('Content events found:', contentEvents);
        
        if (contentEvents.length > 0) {
          responseData = contentEvents[contentEvents.length - 1];
          console.log('Using last content event:', responseData);
        } else {
          // Fallback: check if any object has meaningful content
          console.log('No content events found, checking for meaningful data...');
          for (let i = allJsonData.length - 1; i >= 0; i--) {
            const obj = allJsonData[i];
            if (obj && typeof obj === 'object' && Object.keys(obj).length > 0) {
              // Check if this object has any string values that could be content
              const hasContent = Object.values(obj).some(val => 
                typeof val === 'string' && val.length > 10 && !val.includes('nodeId')
              );
              if (hasContent) {
                responseData = obj;
                console.log('Using object with content:', responseData);
                break;
              }
            }
          }
          
          if (!responseData) {
            console.error('No message content found in streaming response, using fallback');
            responseData = { 
              response: "I received your message but the AI response was not properly formatted. Please try rephrasing your question or contact support if this continues.",
              isRawText: true 
            };
          }
        }
      } else {
        console.log('No JSON objects found, treating as raw text');
        responseData = { 
          response: responseText, 
          isRawText: true 
        };
      }
    } else {
      // Try to parse as single JSON response
      try {
        responseData = JSON.parse(responseText);
        console.log('Successfully parsed single JSON response:', responseData);
      } catch (parseError) {
        console.error('Failed to parse webhook response as JSON:', parseError);
        responseData = { response: responseText, isRawText: true };
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