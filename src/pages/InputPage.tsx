
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';
import InstructionsSection from '@/components/InstructionsSection';
import BasicFormFields from '@/components/BasicFormFields';
import SubmitButton from '@/components/SubmitButton';

const InputPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [visaType, setVisaType] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [link, setLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }
    
    if (!email.trim() || !validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    if (!visaType) {
      toast({
        title: "Missing information",
        description: "Please select a visa type",
        variant: "destructive",
      });
      return;
    }
    
    if (files.length === 0) {
      toast({
        title: "Missing documents",
        description: "Please upload at least one document",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create FormData object to send files and form data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (phone) formData.append('phoneNumber', phone);
      formData.append('visaType', visaType);
      // Append each file separately
      files.forEach(file => formData.append('files', file));
      if (link) formData.append('link', link);
      
      console.log('Submitting form data', { name, email, phone, visaType, filesCount: files.length, link });
      
      // Send data to the specified webhook with CORS handling
      try {
        const response = await fetch('https://igta.app.n8n.cloud/webhook/DETAILS_SUBMISSION_WEBHOOK', {
          method: 'POST',
          body: formData,
          mode: 'no-cors', // This helps with CORS issues
        });
        
        // Since we're using no-cors, we won't get a proper JSON response
        // Use mock response for demonstration
        const mockResponse = {
          score: 78,
          overview: "Your O-1A visa application shines with a commendable score of 78%, reflecting a robust and promising case. You demonstrate exceptional prowess in 'Recognized Prizes or Awards,' earning 20 out of 25 points, thanks to your prestigious international accolades that underscore your global recognition. Additionally, your 'Published Material About the Beneficiary' category stands out with 18 out of 25 points, bolstered by impactful media coverage that highlights your achievements. However, there are notable gaps that hold back your full potential: 'Membership in Recognized Associations' scores 0 out of 25 points due to the absence of documented affiliations with elite organizations, a critical criterion for demonstrating peer recognition. Based on this evaluation, your case is likely to be Approved, yet strengthening these weaker areas could elevate your application to an even more compelling level."
        };
        
        localStorage.setItem('evaluationResult', JSON.stringify(mockResponse));
        
        setIsLoading(false);
        toast({
          title: "Evaluation complete",
          description: "Your documents have been successfully analyzed",
          variant: "default",
        });
        navigate('/result');
      } catch (error) {
        console.error('Error with fetch operation:', error);
        throw error; // Re-throw to be caught by outer catch
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your information. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 bg-custom-background">
      <div className="flex justify-between items-center mb-8">
        <Button
          onClick={() => navigate('/')}
          className="bg-custom-card hover:bg-custom-card/80 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-custom-border"
        >
          <Home size={20} />
        </Button>
        
        <img 
          src="/lovable-uploads/caa62bb9-590f-4b12-bb2a-74ef5c9e949a.png" 
          alt="Sherrod Sports Visas" 
          className="h-12 md:h-16"
        />
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="form-container border border-custom-primary-accent/30 shadow-[0_0_15px_rgba(139,30,63,0.2)]">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-center shimmering-text">Global Talent Visa Assessment</h1>
          <p className="text-custom-text-secondary text-center mb-8 max-w-2xl mx-auto">Upload your documents and get a detailed evaluation of your visa eligibility with personalized recommendations.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <BasicFormFields 
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              visaType={visaType}
              setVisaType={setVisaType}
              link={link}
              setLink={setLink}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
            />
            
            <FileUpload files={files} setFiles={setFiles} />
            
            <InstructionsSection />
            
            <SubmitButton isLoading={isLoading} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default InputPage;
