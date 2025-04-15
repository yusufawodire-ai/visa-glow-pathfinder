
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, SendHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getEvaluationResult } from '@/lib/supabase';

interface EvaluationResult {
  score: number;
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
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`user-${Math.random().toString(36).substring(2, 15)}`);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('evaluationResult');
    if (storedResult) {
      try {
        const result = JSON.parse(storedResult) as EvaluationResult;
        console.log('Retrieved result from sessionStorage:', result);
        setEvaluationResult(result);
        
        if (result.evaluationId) {
          fetchEvaluationFromStorage(result.evaluationId.toString());
        } else {
          if (result.score && result.overview) {
            startChat(result);
          } else {
            throw new Error('Incomplete evaluation data');
          }
        }
      } catch (error) {
        console.error('Error parsing stored result:', error);
        toast({
          title: "Data error",
          description: "Could not retrieve your evaluation data. Please try again.",
          variant: "destructive",
        });
        navigate('/input');
      }
    } else {
      toast({
        title: "No evaluation found",
        description: "Please complete the evaluation form first.",
        variant: "destructive",
      });
      navigate('/input');
    }
    
    return () => {
    };
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
        startChat(formattedResult);
      } else {
        console.warn('No evaluation found with ID:', id);
        if (evaluationResult?.score && evaluationResult?.overview) {
          startChat(evaluationResult);
        } else {
          throw new Error('Evaluation not found');
        }
      }
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      if (evaluationResult?.score && evaluationResult?.overview) {
        startChat(evaluationResult);
      } else {
        toast({
          title: "Data retrieval error",
          description: "Could not retrieve your complete evaluation data.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const startChat = async (result: EvaluationResult) => {
    setIsLoading(true);
    
    try {
      console.log('Starting chat with context', result);
      
      const response = await fetch('https://igta.app.n8n.cloud/webhook/START_CHAT_WEBHOOK', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context: result }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const rawResponse = await response.text();
      console.log('Raw chat webhook response:', rawResponse);
      
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(rawResponse);
        console.log('Parsed chat webhook response:', jsonResponse);
      } catch (parseError) {
        console.error('Error parsing chat webhook response:', parseError, 'Raw response:', rawResponse);
        throw new Error('Invalid JSON response from chat webhook');
      }
      
      let initialMessage;
      
      // Detect the location of the response in the JSON
      if (jsonResponse.response) {
        initialMessage = jsonResponse.response;
      } else if (jsonResponse.message) {
        initialMessage = jsonResponse.message;
      } else if (jsonResponse.data && jsonResponse.data.response) {
        initialMessage = jsonResponse.data.response;
      } else {
        // Fallback if no specific response structure is found
        initialMessage = `Hi! I'm here to help with your ${result.score}% visa application. I've analyzed your documents and can provide guidance on improving your application. What would you like to know?`;
      }
      
      setChatMessages([{ sender: 'AI', message: initialMessage }]);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Chat initialization failed",
        description: "Could not connect to the chat service. Using offline mode.",
        variant: "destructive",
      });
      
      const fallbackMessage = `Hi! I'm here to help with your visa application. Your score is ${result.score}%, which is promising. Based on your evaluation, I can offer some guidance. What specific aspect of your visa application would you like to discuss?`;
      
      setChatMessages([{ sender: 'AI', message: fallbackMessage }]);
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;
    
    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    setChatMessages(prev => [...prev, { sender: 'You', message: userMessage }]);
    setIsLoading(true);
    
    try {
      console.log('Sending message', { sessionId, message: userMessage });
      
      const response = await fetch('https://igta.app.n8n.cloud/webhook/SEND_MESSAGE_WEBHOOK', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId,
          message: userMessage,
          evaluationId: evaluationResult?.evaluationId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const rawResponse = await response.text();
      console.log('Raw message webhook response:', rawResponse);
      
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(rawResponse);
        console.log('Parsed message webhook response:', jsonResponse);
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
        aiResponse = generateFallbackResponse(userMessage);
      }
      
      setChatMessages(prev => [...prev, { sender: 'AI', message: aiResponse }]);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Message failed",
        description: "Could not send your message. Using offline mode.",
        variant: "destructive",
      });
      
      const fallbackResponse = generateFallbackResponse(userMessage);
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'AI', message: fallbackResponse }]);
        setIsLoading(false);
      }, 1000);
    }
  };
  
  const generateFallbackResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes("thank")) {
      return "You're welcome! I'm here to help with any other questions about your visa application. Feel free to ask about specific criteria, documentation needs, or next steps in the process.";
    } else if (lowerMsg.includes("score") || lowerMsg.includes("result")) {
      return `Your overall score of ${evaluationResult?.score || 78}% is quite strong! Here's a summary of your evaluation:\n\n${evaluationResult?.overview || "You have a promising application with some areas that could be strengthened."}\n\nIs there a specific aspect you'd like more guidance on?`;
    } else if (lowerMsg.includes("improve") || lowerMsg.includes("better")) {
      return "To improve your visa application, focus on gathering stronger evidence in the categories where you scored lower. This might include joining professional associations, documenting your contributions to your field, or obtaining additional letters of recommendation from experts. Would you like specific suggestions for your case?";
    } else {
      return "Thanks for your question. While I'm currently operating in offline mode, I can still provide general guidance on visa applications. Based on your evaluation, you have a strong case that could be further improved in certain areas. Is there a specific aspect of the visa process you'd like to know more about?";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!evaluationResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-visa-dark-gray">
        <Loader2 size={48} className="animate-spin text-visa-light-lilac" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 bg-visa-dark-gray">
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
                  strokeDasharray={`${2 * Math.PI * 45 * (evaluationResult?.score || 0) / 100} ${2 * Math.PI * 45 * (1 - (evaluationResult?.score || 0) / 100)}`}
                  strokeDashoffset={2 * Math.PI * 45 * 0.25}
                  strokeLinecap="round"
                  className="animate-pulse-glow"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EBC250" />
                    <stop offset="100%" stopColor="#FFFFFF" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-3xl font-bold text-white">{evaluationResult?.score || 0}%</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-visa-gold to-white bg-clip-text text-transparent">
            Overview
          </h2>
          
          <div className="prose prose-invert flex-grow overflow-auto">
            <p className="text-white whitespace-pre-line">{evaluationResult?.overview || "No overview available"}</p>
          </div>
        </div>
        
        <div className="glass-container flex flex-col h-full">
          <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-visa-gold to-white bg-clip-text text-transparent">
            Chat with Us
          </h2>
          
          <ScrollArea className="flex-grow mb-4 pr-4 h-[400px]">
            <div className="space-y-4">
              {chatMessages.map((message, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg max-w-[85%] ${
                    message.sender === 'AI' 
                      ? 'bg-visa-navy/60 mr-auto' 
                      : 'bg-visa-burgundy/60 ml-auto'
                  }`}
                >
                  <p className="text-xs text-gray-300 mb-1">{message.sender}</p>
                  <p className="whitespace-pre-line text-white">{message.message}</p>
                </div>
              ))}
              
              {isLoading && (
                <div className="bg-visa-navy/60 p-3 rounded-lg max-w-[85%] mr-auto">
                  <p className="text-xs text-gray-300 mb-1">AI</p>
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="h-2 w-2 bg-gray-300 rounded-full animate-pulse delay-100"></div>
                    <div className="h-2 w-2 bg-gray-300 rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          
          <div className="flex">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="input-field flex-grow resize-none mr-2"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !currentMessage.trim()}
              className="bg-black text-white hover:bg-gray-900 font-medium px-4 py-2 rounded-lg transition-all duration-300 group flex items-center animate-pulse-glow shadow-xl"
            >
              <SendHorizontal 
                size={20} 
                className="mr-2 group-hover:translate-x-1 transition-transform text-white" 
              />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
