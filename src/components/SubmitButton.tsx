
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SubmitButtonProps {
  isLoading: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Stop at 95% until actually complete
        return prev + Math.random() * 3 + 1; // Random increment between 1-4%
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="pt-6 flex flex-col items-center">
      {isLoading && (
        <div className="w-full max-w-sm mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">Processing...</span>
            <span className="text-white text-sm">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="bg-visa-gold text-black hover:bg-amber-500 transition-colors flex items-center justify-center min-w-[220px] group rounded-md px-6 py-3 font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="mr-2 animate-spin" />
            Processing...
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
