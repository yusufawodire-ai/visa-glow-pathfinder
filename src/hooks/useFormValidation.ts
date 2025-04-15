
import { useToast } from '@/hooks/use-toast';

export const useFormValidation = () => {
  const { toast } = useToast();
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = (
    name: string,
    email: string,
    visaType: string,
    files: File[]
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

  return { validateEmail, validateForm };
};
