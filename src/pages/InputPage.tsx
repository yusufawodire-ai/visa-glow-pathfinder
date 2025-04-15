
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';
import InstructionsSection from '@/components/InstructionsSection';
import BasicFormFields from '@/components/BasicFormFields';
import SubmitButton from '@/components/SubmitButton';
import PageHeader from '@/components/PageHeader';
import FormContainer from '@/components/FormContainer';
import { useFormValidation } from '@/hooks/useFormValidation';
import { submitEvaluationData } from '@/services/webhookService';

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
  
  const { validateForm } = useFormValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(name, email, visaType, files)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await submitEvaluationData({
        name,
        email,
        phone,
        visaType,
        files,
        link
      });
      
      if (!result) {
        throw new Error('No evaluation result returned');
      }
      
      sessionStorage.setItem('evaluationResult', JSON.stringify(result));
      
      setIsLoading(false);
      toast({
        title: "Evaluation complete",
        description: "Your documents have been successfully analyzed",
        variant: "default",
      });
      navigate('/result');
    } catch (error) {
      console.error('Error submitting form:', error);
      
      let errorMessage = 'There was an error submitting your information. Please try again.';
      
      if (error instanceof Error) {
        // Provide more specific error messages based on the error
        if (error.message.includes('Server returned error')) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else if (error.message.includes('Invalid JSON')) {
          errorMessage = 'The server returned an invalid response. Please try again.';
        } else if (error.message.includes('Expected webhook response format')) {
          errorMessage = 'Invalid response format from evaluation service. Please contact support.';
        }
      }
      
      toast({
        title: "Submission failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 bg-gradient-to-b from-visa-background to-visa-dark-gray/80">
      <PageHeader 
        logoSrc="/lovable-uploads/659255b7-8321-4cb4-ba30-23527ef785e9.png"
        logoAlt="Sherrod Sports Visas"
      />
      
      <FormContainer
        title="Start Visa Assessment"
        description="Upload your documents and get a detailed evaluation of your visa eligibility with personalized recommendations."
      >
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
      </FormContainer>
    </div>
  );
};

export default InputPage;
