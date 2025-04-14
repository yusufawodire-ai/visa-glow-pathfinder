
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-white relative overflow-hidden blue-glow">
      <div className="max-w-3xl w-full text-center space-y-8 z-10">
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/659255b7-8321-4cb4-ba30-23527ef785e9.png" 
            alt="Sherrod Sports Visas" 
            className="w-96 h-auto"
          />
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold bg-gradient-to-r from-visa-blue to-visa-bright-blue bg-clip-text text-transparent">
          Evaluate Your Visa Eligibility
        </h1>
        
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
          Upload your documents and get a detailed evaluation of your visa eligibility with personalized recommendations.
        </p>
        
        <div className="pt-6">
          <button 
            onClick={() => navigate('/input')}
            className="gradient-btn group animate-pulse-glow"
          >
            Start Evaluation
            <ArrowRight className="ml-2 inline-block group-hover:translate-x-1 transition-transform" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
