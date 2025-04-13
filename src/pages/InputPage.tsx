
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Upload, Home, Link as LinkIcon, ChevronDown, ChevronUp, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InputPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [visaType, setVisaType] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [link, setLink] = useState('');
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const newFiles = Array.from(e.target.files);
    const validFiles = newFiles.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB
      
      if (!isValidType || !isValidSize) {
        toast({
          title: "Invalid file",
          description: `${file.name} is ${!isValidType ? 'not an accepted file type' : 'larger than 20MB'}`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
    
    // Show success toast when files are added
    if (validFiles.length > 0) {
      toast({
        title: "Files added",
        description: `${validFiles.length} file${validFiles.length > 1 ? 's' : ''} successfully added`,
        variant: "default",
      });
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!e.dataTransfer.files?.length) return;
    
    const newFiles = Array.from(e.dataTransfer.files);
    const validFiles = newFiles.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB
      
      if (!isValidType || !isValidSize) {
        toast({
          title: "Invalid file",
          description: `${file.name} is ${!isValidType ? 'not an accepted file type' : 'larger than 20MB'}`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
    
    // Show success toast when files are dropped
    if (validFiles.length > 0) {
      toast({
        title: "Files added",
        description: `${validFiles.length} file${validFiles.length > 1 ? 's' : ''} successfully added`,
        variant: "default",
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    toast({
      title: "File removed",
      description: "Document successfully removed",
      variant: "default",
    });
  };

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
      
      // In a real implementation, use the actual webhook URL
      // const response = await fetch('https://igta.app.n8n.cloud/webhook/DETAILS_SUBMISSION_WEBHOOK', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();
      
      // Mock response for demonstration
      const mockResponse = {
        score: 78,
        overview: "Your O-1A visa application shines with a commendable score of 78%, reflecting a robust and promising case. You demonstrate exceptional prowess in 'Recognized Prizes or Awards,' earning 20 out of 25 points, thanks to your prestigious international accolades that underscore your global recognition. Additionally, your 'Published Material About the Beneficiary' category stands out with 18 out of 25 points, bolstered by impactful media coverage that highlights your achievements. However, there are notable gaps that hold back your full potential: 'Membership in Recognized Associations' scores 0 out of 25 points due to the absence of documented affiliations with elite organizations, a critical criterion for demonstrating peer recognition. Based on this evaluation, your case is likely to be Approved, yet strengthening these weaker areas could elevate your application to an even more compelling level."
      };
      
      localStorage.setItem('evaluationResult', JSON.stringify(mockResponse));
      
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Evaluation complete",
          description: "Your documents have been successfully analyzed",
          variant: "default",
        });
        navigate('/result');
      }, 1500);
      
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
      <Button
        onClick={() => navigate('/')}
        className="mb-8 bg-visa-dark-gray hover:bg-visa-dark-gray/80 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-visa-light-lilac/30 animate-pulse-glow"
      >
        <Home size={20} />
      </Button>
      
      <div className="max-w-4xl mx-auto">
        <div className="form-container border border-visa-lilac/30 animate-pulse-glow backdrop-blur-sm">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-center bg-gradient-to-r from-visa-lilac to-visa-light-lilac bg-clip-text text-transparent">Global Talent Visa Assessment</h1>
          <p className="text-gray-300 text-center mb-8 max-w-2xl mx-auto">Upload your documents and get a detailed evaluation of your visa eligibility with personalized recommendations.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-white mb-2 font-medium">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="input-field transition-all duration-300 focus:shadow-[0_0_15px_rgba(167,139,250,0.5)]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-white mb-2 font-medium">Email Address<span className="text-red-500">*</span></label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="input-field transition-all duration-300 focus:shadow-[0_0_15px_rgba(167,139,250,0.5)]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-white mb-2 font-medium">Phone Number <span className="text-gray-400">(Optional)</span></label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="input-field transition-all duration-300 focus:shadow-[0_0_15px_rgba(167,139,250,0.5)]"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="visaType" className="block text-white mb-2 font-medium">Target Visa Type</label>
              <div className="relative">
                <button
                  type="button"
                  className="input-field flex justify-between items-center transition-all duration-300 hover:border-visa-light-lilac/70"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className={visaType ? "text-white" : "text-gray-400"}>
                    {visaType || "Select visa type"}
                  </span>
                  <ChevronDown size={20} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-visa-dark-gray border border-visa-lilac/30 rounded-lg shadow-lg shadow-visa-light-lilac/20 animate-fade-in">
                    {["O-1A", "EB-1", "O-1B", "NIW", "Not sure which one to choose"].map((type) => (
                      <div
                        key={type}
                        className="px-4 py-3 hover:bg-visa-lilac/20 cursor-pointer transition-colors duration-200"
                        onClick={() => {
                          setVisaType(type);
                          setDropdownOpen(false);
                          toast({
                            title: "Visa type selected",
                            description: `You've selected ${type}`,
                            variant: "default",
                          });
                        }}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-white mb-2 font-medium">Upload Documents</label>
              <div
                className={`file-upload-area transition-all duration-300 ${isDragging ? 'border-visa-light-lilac border-opacity-80 bg-visa-dark-gray/80 shadow-[0_0_30px_rgba(167,139,250,0.3)]' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload size={40} className={`${isDragging ? 'text-visa-light-lilac' : 'text-blue-400'} mb-3 transition-all`} />
                <p className={`${isDragging ? 'text-visa-light-lilac' : 'text-blue-400'} mb-1 font-medium transition-all`}>
                  {isDragging ? 'Drop files here' : 'Drag & drop files here or click to browse'}
                </p>
                <p className="text-gray-400 text-sm">Accept PDF, DOC, JPG (up to 20MB each)</p>
              </div>
              
              {files.length > 0 && (
                <div className="mt-4 space-y-2 animate-fade-in">
                  <p className="text-sm font-medium text-visa-light-lilac">Selected Files:</p>
                  {files.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between bg-visa-dark-gray/70 p-3 rounded-lg border border-visa-lilac/20 hover:border-visa-lilac/40 transition-all"
                    >
                      <div className="flex items-center">
                        <CheckCircle size={16} className="text-green-400 mr-2" />
                        <span className="truncate max-w-[80%]">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-visa-dark-gray/50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="link" className="block text-white mb-2 font-medium">Relevant Links <span className="text-gray-400">(Optional)</span></label>
              <div className="relative">
                <input
                  id="link"
                  type="text"
                  placeholder="LinkedIn, personal website, articles, etc."
                  className="input-field pl-10 transition-all duration-300 focus:shadow-[0_0_15px_rgba(167,139,250,0.5)]"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
                <LinkIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400 mt-1">Add LinkedIn profile, professional website, portfolios, or press coverage</p>
            </div>
            
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
                  <p className="mt-4 text-sm text-gray-400 border-t border-visa-lilac/10 pt-3">
                    Submitting comprehensive documentation will help provide a more accurate assessment. 
                    All documents are processed securely and confidentially.
                  </p>
                </div>
              )}
            </div>
            
            <div className="pt-6 flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="gradient-btn flex items-center justify-center min-w-[220px] group"
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default InputPage;
