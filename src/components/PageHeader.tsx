
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  logoSrc: string;
  logoAlt: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ logoSrc, logoAlt }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-8">
      <Button
        onClick={() => navigate('/')}
        className="bg-visa-dark-gray hover:bg-visa-dark-gray/80 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-visa-light-lilac/30 animate-pulse-glow"
      >
        <Home size={20} />
      </Button>
      
      <img 
        src={logoSrc} 
        alt={logoAlt} 
        className="h-20 w-auto"
      />
    </div>
  );
};

export default PageHeader;
