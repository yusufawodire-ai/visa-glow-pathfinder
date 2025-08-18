
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, SendHorizontal, Loader2, AlertTriangle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getEvaluationResult } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EvaluationResult {
  score: string | number;
  overview: string;
  evaluationId?: string | number;
}

interface ChatMessage {
  sender: 'You' | 'AI';
  message: string;
}

const ResultPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [sessionId] = useState(`user-${Math.random().toString(36).substring(2, 15)}`);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('evaluationResult');

    if (!storedResult) {
      setIsLoading(false);
      setError("No evaluation data found. Please complete the form first.");
      toast({
        title: "No evaluation found",
        description: "Please complete the evaluation form first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = JSON.parse(storedResult) as EvaluationResult;
      console.log('Retrieved result from sessionStorage:', result);

      if (!result.score || !result.overview) {
        throw new Error('Incomplete evaluation data');
      }

      setEvaluationResult(result);
      
      // Show welcome message immediately
      setChatMessages([{ 
        sender: 'AI', 
        message: "Hi I am here to assist you with your visa, where would you like to start" 
      }]);
      setIsLoading(false);

      // Send context to backend in background (non-blocking)
      if (result.evaluationId) {
        fetchEvaluationFromStorage(result.evaluationId.toString());
      } else {
        // Send context to backend without blocking UI
        console.log('No evaluationId found, sending context to backend');
        sendContextToBackend(result);
      }
    } catch (error) {
      console.error('Error parsing stored result:', error);
      setIsLoading(false);
      setError("Invalid evaluation data. Please try submitting the form again.");
      toast({
        title: "Data error",
        description: "Could not retrieve your evaluation data. Please try again.",
        variant: "destructive",
      });
    }
  }, [navigate, toast]);

  const fetchEvaluationFromStorage = async (id: string) => {
    try {
      console.log('Fetching evaluation with ID:', id);
      const supabaseResult = await getEvaluationResult(id);

      if (supabaseResult) {
        console.log('Retrieved evaluation from storage:', supabaseResult);
        const formattedResult: EvaluationResult = {
          score: supabaseResult.score,
          overview: supabaseResult.overview,
          evaluationId: supabaseResult.id
        };
        setEvaluationResult(formattedResult);
        // Send context to backend in background (non-blocking)
        sendContextToBackend(formattedResult);
      } else {
        console.warn('No evaluation found with ID:', id);
        if (evaluationResult?.score && evaluationResult?.overview) {
          sendContextToBackend(evaluationResult);
        } else {
          console.error('Evaluation not found in database');
        }
      }
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      console.log('Could not fetch full evaluation details, continuing with cached data');
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Send context to backend without blocking UI
  const sendContextToBackend = async (result: EvaluationResult) => {
    try {
      console.log('Sending context to backend with evaluation result:', result);
      
      const initResponse = await fetch('https://igta.app.n8n.cloud/webhook-test/START_CHAT_OUTPUT_WEBHOOK', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          context: result,
          evaluationId: result.evaluationId || 'no-id',
          score: result.score,
          overview: result.overview
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!initResponse.ok) {
        console.warn(`Failed to send context to backend. Status: ${initResponse.status}`);
        return;
      }

      const initResponseText = await initResponse.text();
      console.log('Context sent to backend successfully:', initResponseText);
      
    } catch (error) {
      console.error('Error sending context to backend:', error);
      // Don't show error to user since this is background operation
    }
  };


  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    setChatMessages((prev) => [...prev, { sender: 'You', message: userMessage }]);
    
    // Show a temporary loading message
    setChatMessages((prev) => [...prev, { sender: 'AI', message: '...' }]);

    try {
      console.log('Sending user message to USER_MESSAGE_OUTPUT_WEBHOOK:', { 
        sessionId, 
        message: userMessage,
        evaluationId: evaluationResult?.evaluationId || 'no-id'
      });
      
      const response = await fetch('https://igta.app.n8n.cloud/webhook/USER_MESSAGE_OUTPUT_WEBHOOK', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
          evaluationId: evaluationResult?.evaluationId || 'no-id',
          score: evaluationResult?.score,
          overview: evaluationResult?.overview
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const rawResponse = await response.text();
      console.log('Raw USER_MESSAGE_OUTPUT_WEBHOOK response:', rawResponse);

      let jsonResponse;
      try {
        jsonResponse = JSON.parse(rawResponse);
        console.log('Parsed USER_MESSAGE_OUTPUT_WEBHOOK response:', jsonResponse);
      } catch (parseError) {
        console.error('Error parsing message webhook response:', parseError);
        throw new Error('Invalid JSON response from message webhook');
      }

      let aiResponse;
      if (jsonResponse.response) {
        aiResponse = jsonResponse.response;
      } else if (jsonResponse.message) {
        aiResponse = jsonResponse.message;
      } else if (jsonResponse.data && jsonResponse.data.response) {
        aiResponse = jsonResponse.data.response;
      } else {
        throw new Error('Response format not recognized');
      }

      // Replace the loading message with the actual response
      setChatMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { sender: 'AI', message: aiResponse };
        return newMessages;
      });
      setChatError(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatError("Could not send your message. Please try again.");

      const defaultResponse = "I'm sorry, I couldn't process your message right now. Please try again or rephrase your question.";
      
      // Replace the loading message with error response
      setChatMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { sender: 'AI', message: defaultResponse };
        return newMessages;
      });

      toast({
        title: "Message failed",
        description: "Could not send your message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading && !evaluationResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0A04]">
        <div className="flex flex-col items-center">
          <Loader2 size={48} className="animate-spin text-visa-light-lilac mb-4" />
          <p className="text-white">Loading your evaluation results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0A04]">
        <div className="glass-container max-w-md p-8 text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-visa-gold" />
          <h2 className="text-2xl font-semibold mb-4 text-white">Evaluation Error</h2>
          <p className="text-white mb-6">{error}</p>
          <Button
            onClick={() => navigate('/input')}
            className="bg-visa-gold text-black hover:bg-visa-gold/80"
          >
            Return to Form
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 bg-[#050404]">
      <div className="flex justify-between items-center mb-8">
        <Button
          onClick={() => navigate('/')}
          className="bg-visa-navy hover:bg-visa-navy/80 rounded-full w-10 h-10 p-0 flex items-center justify-center"
        >
          <Home size={20} className="text-white" />
        </Button>
        
        <img 
          src="/lovable-uploads/659255b7-8321-4cb4-ba30-23527ef785e9.png" 
          alt="Sherrod Sports Visas" 
          className="h-20 w-auto"
        />
      </div>
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {evaluationResult ? (
          <div className="glass-container flex flex-col h-full">
            <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-visa-gold to-white bg-clip-text text-transparent">
              Your Chances of Success
            </h2>
            
            <div className="flex justify-center mb-8">
              <div className="relative h-40 w-40 flex items-center justify-center">
                <svg className="absolute inset-0" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(106, 78, 127, 0.2)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 45 * (parseFloat(evaluationResult.score.toString().replace('%', '')) / 100)} ${2 * Math.PI * 45 * (1 - (parseFloat(evaluationResult.score.toString().replace('%', '')) / 100))}`}
                    strokeDashoffset={2 * Math.PI * 45 * 0.25}
                    strokeLinecap="round"
                    className="animate-glow-pulse"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FEF7CD" />
                      <stop offset="100%" stopColor="#EBC250" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-3xl font-bold text-white">
                  {typeof evaluationResult.score === 'string' ? evaluationResult.score : `${evaluationResult.score}%`}
                </span>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-visa-gold to-white bg-clip-text text-transparent">
              Overview
            </h2>
            
            <div className="prose prose-invert flex-grow overflow-auto">
              <p className="text-white whitespace-pre-line">{evaluationResult.overview}</p>
            </div>
          </div>
        ) : null}
        
        <div className="glass-container flex flex-col h-[750px]">
          <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-visa-gold to-white bg-clip-text text-transparent">
            Chat with Us
          </h2>
          
          {chatError && (
            <Alert variant="destructive" className="mb-4 border-red-500 bg-red-900/20 text-white">
              <AlertDescription>{chatError}</AlertDescription>
            </Alert>
          )}
          
          <ScrollArea className="flex-grow mb-4 pr-4">
            <div className="space-y-4">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === 'You' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender === 'You'
                        ? 'bg-visa-gold text-black'
                        : 'bg-visa-navy text-white'
                    }`}
                  >
                    {msg.sender === 'AI' && i === 0 && (
                      <div className="bg-visa-gold/20 text-visa-gold text-xs px-2 py-0.5 rounded-full inline-block mb-2">
                        AI Assistant
                      </div>
                    )}
                    <p className="whitespace-pre-line">{msg.message}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-visa-navy text-white max-w-[80%] rounded-lg p-3">
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          
          <div className="flex items-center gap-2 mt-auto">
            <textarea
              className="bg-visa-dark-gray border border-visa-lilac/30 rounded-lg px-4 py-2 text-white placeholder:text-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-visa-light-lilac resize-none"
              placeholder="Type your message..."
              rows={2}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              className="bg-visa-gold hover:bg-visa-gold/80 text-black h-10 w-10 rounded-full p-0 flex-shrink-0"
              disabled={isLoading || !currentMessage.trim()}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <SendHorizontal size={20} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

