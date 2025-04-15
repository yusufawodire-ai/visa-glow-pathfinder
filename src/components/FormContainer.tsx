
import React, { ReactNode } from 'react';

interface FormContainerProps {
  title: string;
  description: string;
  children: ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ title, description, children }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="form-container border border-visa-lilac/30 animate-pulse-glow backdrop-blur-sm">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-center bg-gradient-to-r from-visa-burgundy to-visa-gold bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-gray-300 text-center mb-8 max-w-2xl mx-auto">{description}</p>
        {children}
      </div>
    </div>
  );
};

export default FormContainer;
