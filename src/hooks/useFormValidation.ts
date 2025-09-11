
import { useToast } from '@/hooks/use-toast';

export const useFormValidation = () => {
  const { toast } = useToast();
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateLink = (link: string) => {
    if (!link.trim()) return true; // Empty link is allowed
    
    const socialMediaDomains = [
      'linkedin.com', 'facebook.com', 'twitter.com', 'x.com',
      'instagram.com', 'tiktok.com', 'youtube.com', 'youtu.be',
      'snapchat.com', 'pinterest.com', 'reddit.com', 'github.com'
    ];
    
    const url = link.toLowerCase();
    return !socialMediaDomains.some(domain => 
      url.includes(domain) || url.includes(`www.${domain}`)
    );
  };

  const validateForm = (
    name: string,
    email: string,
    visaType: string,
    files: File[],
    link: string
  ) => {
    if (!name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return false;
    }
    
    if (!email.trim() || !validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }
    
    if (!visaType) {
      toast({
        title: "Missing information",
        description: "Please select a visa type",
        variant: "destructive",
      });
      return false;
    }
    
    if (link.trim() && !validateLink(link)) {
      toast({
        title: "Invalid link",
        description: "Social media links are not supported. Please provide professional websites, portfolios, or press coverage instead.",
        variant: "destructive",
      });
      return false;
    }
    
    if (files.length === 0) {
      toast({
        title: "Missing documents",
        description: "Please upload at least one document",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  return { validateEmail, validateForm, validateLink };
};
