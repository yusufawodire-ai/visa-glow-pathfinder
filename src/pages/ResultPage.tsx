
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, SendHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
    // Get evaluation result from localStorage
    const storedResult = localStorage.getItem('evaluationResult');
    if (storedResult) {
      const result = JSON.parse(storedResult) as EvaluationResult;
      setEvaluationResult(result);
      
      // Start a chat with the AI using the evaluation result as context
      startChat(result);
    } else {
      // If no result is found, redirect to input page
      toast({
        title: "No evaluation found",
        description: "Please complete the evaluation form first.",
        variant: "destructive",
      });
      navigate('/input');
    }
  }, [navigate, toast]);

  useEffect(() => {
    // Scroll to the bottom of the chat when new messages are added
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const startChat = async (result: EvaluationResult) => {
    setIsLoading(true);
    
    try {
      console.log('Starting chat with context', result);
      
      // For demo purposes, simulate API call
      // In a real implementation, use the actual webhook URL
      // const response = await fetch('https://igta.app.n8n.cloud/webhook/START_CHAT_OUTPUT_WEBHOOK', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ context: result }),
      // });
      
      // const data = await response.json();
      
      // Mock response for demonstration
      const initialMessage = `Hi! I'm here to help with your O-1A visa application. 👋 You scored a strong 78%, excelling in Recognized Prizes (20/25) and Published Material (18/25)—great job! But Membership in Recognized Associations is at 0/25 due to missing evidence. Want to improve this area or ask something else?`;
      
      setTimeout(() => {
        setChatMessages([{ sender: 'AI', message: initialMessage }]);
        setIsLoading(false);
      }, 1000);
      
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
      
      // For demo purposes, simulate API call
      // In a real implementation, use the actual webhook URL
      // const response = await fetch('https://igta.app.n8n.cloud/webhook/USER_MESSAGE_OUTPUT_WEBHOOK', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ sessionId, message: userMessage }),
      // });
      
      // const data = await response.json();
      
      // Mock AI response for demonstration
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
      <div className="min-h-screen flex items-center justify-center bg-custom-background">
        <Loader2 size={48} className="animate-spin text-custom-primary-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 bg-custom-background">
      <div className="flex justify-between items-center mb-8">
        <Button
          onClick={() => navigate('/')}
          className="bg-custom-card hover:bg-custom-card/80 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-custom-border light-glow"
        >
          <Home size={20} />
        </Button>
        
        <img 
          src="/lovable-uploads/69f314e1-76ae-4ee9-bae8-4c284b46919d.png" 
          alt="Sherrod Sports Visas" 
          className="h-12 md:h-16"
        />
      </div>
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="enhanced-glass flex flex-col h-full bg-custom-card/30 border-custom-primary-accent/30 shadow-[0_0_15px_rgba(139,30,63,0.2)]">
          <h2 className="text-2xl font-semibold mb-6 text-center soft-white-glow">
            Your Chances of Success
          </h2>
          
          <div className="flex justify-center mb-8">
            <div className="relative h-40 w-40 flex items-center justify-center active-gradient-circle">
              <svg className="absolute inset-0" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={evaluationResult.score >= 70 ? "#4AFFB2" : evaluationResult.score >= 50 ? "#FFD580" : "#FF719A"}
                  strokeOpacity="0.2"
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
                  className="animate-pulse-strong"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9EC6B8" />
                    <stop offset="100%" stopColor="#7D91A6" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-3xl font-bold text-custom-tertiary-accent">{evaluationResult.score}%</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4 soft-white-glow">
            Overview
          </h2>
          
          <div className="prose prose-invert flex-grow overflow-auto">
            <p className="text-white whitespace-pre-line">{evaluationResult.overview}</p>
          </div>
        </div>
        
        <div className="enhanced-glass flex flex-col h-full bg-custom-card/30 border-custom-primary-accent/30 shadow-[0_0_15px_rgba(139,30,63,0.2)]">
          <h2 className="text-2xl font-semibold mb-6 text-center soft-white-glow">
            Chat with Us
          </h2>
          
          <div className="flex-grow overflow-auto mb-4 space-y-4">
            {chatMessages.map((message, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg max-w-[85%] ${
                  message.sender === 'AI' 
                    ? 'bg-custom-primary-accent/20 mr-auto' 
                    : 'bg-custom-secondary-accent/20 ml-auto border border-custom-border'
                }`}
              >
                <p className="text-xs text-custom-text-secondary mb-1">{message.sender}</p>
                <p className="whitespace-pre-line text-custom-text-primary">{message.message}</p>
              </div>
            ))}
            
            {isLoading && (
              <div className="bg-custom-primary-accent/20 p-3 rounded-lg max-w-[85%] mr-auto">
                <p className="text-xs text-custom-text-secondary mb-1">AI</p>
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-custom-tertiary-accent rounded-full animate-pulse"></div>
                  <div className="h-2 w-2 bg-custom-tertiary-accent rounded-full animate-pulse delay-100"></div>
                  <div className="h-2 w-2 bg-custom-tertiary-accent rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
          
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
              className="gold-gradient-btn p-3 h-auto animate-home-pulse"
            >
              <SendHorizontal size={20} className="text-custom-secondary-accent" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
