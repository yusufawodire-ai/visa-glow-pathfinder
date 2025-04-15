
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';
import InstructionsSection from '@/components/InstructionsSection';
import BasicFormFields from '@/components/BasicFormFields';
import SubmitButton from '@/components/SubmitButton';
import { storeEvaluationResult } from '@/lib/supabase';

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
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (phone) formData.append('phoneNumber', phone);
      formData.append('visaType', visaType);
      files.forEach(file => formData.append('files', file));
      if (link) formData.append('link', link);
      
      console.log('Submitting form data', { name, email, phone, visaType, filesCount: files.length, link });
      
      try {
        // Send data to the webhook
        const response = await fetch('https://igta.app.n8n.cloud/webhook/DETAILS_SUBMISSION_WEBHOOK', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Get the raw text response and log it
        const rawResponse = await response.text();
        console.log('Raw webhook response:', rawResponse);
        
        // Parse the JSON response
        let jsonResponse;
        try {
          jsonResponse = JSON.parse(rawResponse);
          console.log('Parsed webhook response:', jsonResponse);
        } catch (parseError) {
          console.error('Error parsing webhook response:', parseError);
          throw new Error('Invalid JSON response from webhook');
        }
        
        // Extract the evaluation result data from the response
        // The actual structure will depend on your webhook implementation
        let evaluationResult;
        
        // Check if the response contains the expected data
        if (jsonResponse.result && typeof jsonResponse.result === 'object') {
          evaluationResult = jsonResponse.result;
        } else if (jsonResponse.data && typeof jsonResponse.data === 'object') {
          evaluationResult = jsonResponse.data;
        } else if (jsonResponse.score !== undefined && jsonResponse.overview) {
          evaluationResult = jsonResponse;
        } else {
          console.error('Invalid response structure:', jsonResponse);
          throw new Error('Invalid response structure');
        }
        
        console.log('Extracted evaluation result:', evaluationResult);
        
        // Store the evaluation result in Supabase
        const storedResult = await storeEvaluationResult({
          name,
          email,
          phone: phone || undefined,
          visa_type: visaType,
          score: evaluationResult.score,
          overview: evaluationResult.overview,
          user_id: crypto.randomUUID(), // Generate a random ID for anonymous users
        });
        
        console.log('Stored evaluation result in Supabase:', storedResult);
        
        // Pass evaluation result ID to result page
        let navigationData = {
          evaluationId: storedResult?.id,
          score: evaluationResult.score,
          overview: evaluationResult.overview
        };
        
        // Navigate to the result page with the evaluation result
        sessionStorage.setItem('evaluationResult', JSON.stringify(navigationData));
        
        setIsLoading(false);
        toast({
          title: "Evaluation complete",
          description: "Your documents have been successfully analyzed",
          variant: "default",
        });
        navigate('/result');
      } catch (error) {
        console.error('Error with fetch operation:', error);
        toast({
          title: "Error processing response",
          description: "There was a problem with the evaluation service. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
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
    <div className="min-h-screen py-8 px-4 md:px-8 bg-gradient-to-b from-visa-background to-visa-dark-gray/80">
      <div className="flex justify-between items-center mb-8">
        <Button
          onClick={() => navigate('/')}
          className="bg-visa-dark-gray hover:bg-visa-dark-gray/80 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-visa-light-lilac/30 animate-pulse-glow"
        >
          <Home size={20} />
        </Button>
        
        <img 
          src="/lovable-uploads/659255b7-8321-4cb4-ba30-23527ef785e9.png" 
          alt="Sherrod Sports Visas" 
          className="h-20 w-auto"
        />
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="form-container border border-visa-lilac/30 animate-pulse-glow backdrop-blur-sm">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-center bg-gradient-to-r from-visa-burgundy to-visa-gold bg-clip-text text-transparent">
            Start Visa Assessment
          </h1>
          <p className="text-gray-300 text-center mb-8 max-w-2xl mx-auto">Upload your documents and get a detailed evaluation of your visa eligibility with personalized recommendations.</p>
          
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
