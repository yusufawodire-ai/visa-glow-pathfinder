
import React, { useState } from 'react';
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
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [visaType, setVisaType] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [link, setLink] = useState('');
  const [industry, setIndustry] = useState('');
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { validateForm } = useFormValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(name, email, visaType, files, link)) {
      return;
    }

    setIsLoading(true);

    try {
      await submitEvaluationData({
        name,
        email,
        phone,
        visaType,
        files,
        link,
        industry,
        story
      });

      setIsLoading(false);
      setSubmitted(true);
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
      <PageHeader 
        logoSrc="/lovable-uploads/659255b7-8321-4cb4-ba30-23527ef785e9.png"
        logoAlt="Sherrod Sports Visas"
      />
      
      {submitted ? (
        <FormContainer
          title="Thank You"
          description=""
        >
          <div className="text-center text-gray-200 space-y-4 py-4">
            <p className="text-lg">
              Thank you for submitting your information. Our team will review your details and get back to you shortly with the next steps.
            </p>
            <p className="text-lg">
              We appreciate your interest and look forward to speaking with you soon.
            </p>
          </div>
        </FormContainer>
      ) : (
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
              industry={industry}
              setIndustry={setIndustry}
              story={story}
              setStory={setStory}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
            />

            <FileUpload files={files} setFiles={setFiles} />

            <InstructionsSection />

            <SubmitButton isLoading={isLoading} />
          </form>
        </FormContainer>
      )}
    </div>
  );
};

export default InputPage;
