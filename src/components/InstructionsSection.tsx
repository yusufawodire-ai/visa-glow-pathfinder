
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const InstructionsSection: React.FC = () => {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  return (
    <div className="border-t border-visa-lilac/20 pt-4 mt-6">
      <button
        type="button"
        className="flex items-center justify-between w-full text-visa-light-lilac hover:text-white transition-colors"
        onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
      >
        <span className="font-medium">Instructions & Document Types</span>
        {isInstructionsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {isInstructionsOpen && (
        <div className="mt-4 bg-visa-dark-gray/70 p-5 rounded-lg border border-visa-lilac/20 animate-fade-in shadow-inner">
          <h3 className="font-medium mb-3 text-visa-light-lilac">Recommended Documents:</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="text-visa-light-lilac mr-2">•</span> 
              <span>Professional resume or CV</span>
            </li>
            <li className="flex items-start">
              <span className="text-visa-light-lilac mr-2">•</span> 
              <span>Letters of recommendation</span>
            </li>
            <li className="flex items-start">
              <span className="text-visa-light-lilac mr-2">•</span> 
              <span>Evidence of awards or recognition</span>
            </li>
            <li className="flex items-start">
              <span className="text-visa-light-lilac mr-2">•</span> 
              <span>Published articles or media coverage</span>
            </li>
            <li className="flex items-start">
              <span className="text-visa-light-lilac mr-2">•</span> 
              <span>Professional memberships</span>
            </li>
            <li className="flex items-start">
              <span className="text-visa-light-lilac mr-2">•</span> 
              <span>Employment contracts or offer letters</span>
            </li>
          </ul>
          <div className="mt-4 text-sm text-gray-400 border-t border-visa-lilac/10 pt-3">
            <p className="mb-2">
              Submitting comprehensive documentation will help provide a more accurate assessment. 
              All documents are processed securely and confidentially.
            </p>
            <p className="text-visa-light-lilac font-medium">
              Important: Please do not upload more than 5 documents total.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructionsSection;
