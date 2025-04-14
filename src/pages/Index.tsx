
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 home-light-bg">
      <div className="absolute top-4 left-4">
        <img 
          src="/lovable-uploads/caa62bb9-590f-4b12-bb2a-74ef5c9e949a.png" 
          alt="Sherrod Sports Visas" 
          className="h-16 md:h-20"
        />
      </div>
      
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold shimmering-text">
          Evaluate Your Visa Eligibility
        </h1>
        
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
          Upload your documents and get a detailed evaluation of your visa eligibility with personalized recommendations.
        </p>
        
        <div className="pt-6">
          <button 
            onClick={() => navigate('/input')}
            className="gold-gradient-btn group animate-home-pulse"
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
