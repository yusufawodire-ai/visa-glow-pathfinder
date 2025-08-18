
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  isLoading: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const loadingMessages = [
    "Processing your application...",
    "Analyzing your details...",
    "Calculating your chances...",
    "Generating your report..."
  ];

  useEffect(() => {
    if (!isLoading) {
      setCurrentMessage(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading, loadingMessages.length]);

  return (
    <div className="pt-6 flex justify-center">
      <button
        type="submit"
        disabled={isLoading}
        className="bg-visa-gold text-black hover:bg-amber-500 transition-colors flex items-center justify-center min-w-[220px] group rounded-md px-6 py-3 font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="mr-2 animate-spin" />
            {loadingMessages[currentMessage]}
          </>
        ) : (
          <>
            Submit for Evaluation
            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
};

export default SubmitButton;
