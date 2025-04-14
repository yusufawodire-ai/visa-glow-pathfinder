
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#1a1209] relative overflow-hidden">
      {/* Logo at top right with soft glowing white background */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 p-3 rounded-full bg-white/10 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.3)]">
        <img 
          src="/lovable-uploads/659255b7-8321-4cb4-ba30-23527ef785e9.png" 
          alt="Sherrod Sports Visas" 
          className="w-32 md:w-40 h-auto"
        />
      </div>
      
      {/* Content with glow effects similar to the reference image */}
      <div className="max-w-5xl w-full text-center space-y-12 z-10 mt-16">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight">
          <span className="block mb-2">Evaluate your</span>
          <span className="text-visa-gold">Visa Eligibility</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Upload your documents and get a detailed evaluation of your visa eligibility with personalized recommendations.
        </p>
        
        <div className="pt-6">
          <button 
            onClick={() => navigate('/input')}
            className="bg-visa-gold hover:bg-amber-500 text-black px-6 py-3 rounded-md text-lg font-medium transition-colors group"
          >
            Start Evaluation
            <ArrowRight className="ml-2 inline-block group-hover:translate-x-1 transition-transform" size={20} />
          </button>
        </div>
      </div>
      
      {/* Decorative elements similar to the reference image */}
      <div className="absolute w-64 h-64 rounded-full bg-amber-700/20 blur-3xl -bottom-20 -left-20"></div>
      <div className="absolute w-96 h-96 rounded-full bg-amber-700/10 blur-3xl top-20 -right-48"></div>
    </div>
  );
};

export default Index;
