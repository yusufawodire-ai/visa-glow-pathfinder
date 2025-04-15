
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, SendHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with fallback for missing env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create the client if both URL and key are available
const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

interface EvaluationResult {
  score: number;
  overview: string;
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
    // Get the evaluation result from sessionStorage
    const storedResult = sessionStorage.getItem('evaluationResult');
    if (storedResult) {
      const result = JSON.parse(storedResult) as EvaluationResult;
      setEvaluationResult(result);
      
      startChat(result);
    } else {
      toast({
        title: "No evaluation found",
        description: "Please complete the evaluation form first.",
        variant: "destructive",
      });
      navigate('/input');
    }

    // Clean up the session storage when component unmounts
    return () => {
      sessionStorage.removeItem('evaluationResult');
    };
  }, [navigate, toast]);

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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.response) {
        setChatMessages([{ sender: 'AI', message: data.response }]);
      } else {
        throw new Error('Invalid response format from START_CHAT_WEBHOOK');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Chat initialization failed",
        description: "Could not connect to the chat service. Please try again.",
        variant: "destructive",
      });
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
      
      // This will be updated in a future implementation
      let aiResponse = "I'll help you improve your Membership in Recognized Associations score! This category assesses your involvement in prestigious professional organizations. Here's what you can do:\n\n1. Join relevant professional associations in your field\n2. Submit proof of membership (certificates, membership cards)\n3. Highlight leadership roles or significant contributions\n4. Include evidence of selective admission processes\n5. Provide documentation of peer recognition within these organizations\n\nMemberships that require outstanding achievements for admission are particularly valuable. Would you like me to recommend specific associations in your industry?";
      
      if (userMessage.toLowerCase().includes("thank")) {
        aiResponse = "You're welcome! I'm here to help with any other questions about your visa application. Feel free to ask about specific criteria, documentation needs, or next steps in the process.";
      } else if (userMessage.toLowerCase().includes("score")) {
        aiResponse = "Your overall score of 78% is quite strong! Here's the breakdown by category:\n\n• Recognized Prizes/Awards: 20/25 (Excellent)\n• Published Material: 18/25 (Very Good)\n• Memberships: 0/25 (Opportunity for improvement)\n• Judging Others' Work: 15/25 (Good)\n• Original Contributions: 16/25 (Good)\n• High Salary: 9/25 (Moderate)\n\nWith some improvements to your Memberships evidence, you could potentially reach 85-90%.";
      }
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'AI', message: aiResponse }]);
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Message failed",
        description: "Could not send your message. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
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
                  strokeDasharray={`${2 * Math.PI * 45 * evaluationResult.score / 100} ${2 * Math.PI * 45 * (1 - evaluationResult.score / 100)}`}
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
              <span className="text-3xl font-bold text-white">{evaluationResult.score}%</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-visa-gold to-white bg-clip-text text-transparent">
            Overview
          </h2>
          
          <div className="prose prose-invert flex-grow overflow-auto">
            <p className="text-white whitespace-pre-line">{evaluationResult.overview}</p>
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
