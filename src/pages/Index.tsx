
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#1a1209] relative overflow-hidden">
      {/* Logo at top right with soft glow */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <img 
          src="/lovable-uploads/659255b7-8321-4cb4-ba30-23527ef785e9.png" 
          alt="Sherrod Sports Visas" 
          className="w-32 md:w-40 h-auto animate-pulse-glow" 
        />
      </div>
      
      {/* Content with glow effects similar to the reference image */}
      <div className="max-w-5xl w-full text-center space-y-12 z-10 mt-16">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight">
          <span className="block mb-2 text-white">Evaluate your</span>
          <span className="bg-gradient-to-r from-visa-gold via-amber-300 to-white bg-clip-text text-transparent animate-pulse-glow drop-shadow-[0_0_10px_rgba(235,194,80,0.5)]">Visa Eligibility</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Upload your documents and get a detailed evaluation of your visa eligibility with personalized recommendations.
        </p>
        
        <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => navigate('/input')}
            className="bg-visa-gold hover:bg-amber-500 text-black px-6 py-3 rounded-md text-lg font-medium transition-colors group w-full sm:w-auto"
          >
            Start Evaluation
            <ArrowRight className="ml-2 inline-block group-hover:translate-x-1 transition-transform" size={20} />
          </button>
          
          <a 
            href="http://support.innovativeautomations.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center border-2 border-visa-gold text-visa-gold px-6 py-3 rounded-md text-lg font-medium transition-all hover:bg-visa-gold/10 group w-full sm:w-auto"
          >
            Work With Us
            <ExternalLink className="ml-2 inline-block group-hover:translate-x-1 transition-transform" size={20} />
          </a>
        </div>
      </div>
      
      {/* Decorative elements similar to the reference image */}
      <div className="absolute w-64 h-64 rounded-full bg-amber-700/20 blur-3xl -bottom-20 -left-20"></div>
      <div className="absolute w-96 h-96 rounded-full bg-amber-700/10 blur-3xl top-20 -right-48"></div>
    </div>
  );
};

export default Index;
