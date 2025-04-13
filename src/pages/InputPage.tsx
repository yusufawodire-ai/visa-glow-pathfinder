import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Upload, Home, Link as LinkIcon, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
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
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
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
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
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
      
      const mockResponse = {
        score: 78,
        overview: "Your O-1A visa application shines with a commendable score of 78%, reflecting a robust and promising case. You demonstrate exceptional prowess in 'Recognized Prizes or Awards,' earning 20 out of 25 points, thanks to your prestigious international accolades that underscore your global recognition. Additionally, your 'Published Material About the Beneficiary' category stands out with 18 out of 25 points, bolstered by impactful media coverage that highlights your achievements. However, there are notable gaps that hold back your full potential: 'Membership in Recognized Associations' scores 0 out of 25 points due to the absence of documented affiliations with elite organizations, a critical criterion for demonstrating peer recognition. Based on this evaluation, your case is likely to be Approved, yet strengthening these weaker areas could elevate your application to an even more compelling level."
      };
      
      localStorage.setItem('evaluationResult', JSON.stringify(mockResponse));
      
      setTimeout(() => {
        setIsLoading(false);
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
    <div className="min-h-screen py-8 px-4 md:px-8">
      <Button
        onClick={() => navigate('/')}
        className="mb-8 bg-visa-dark-gray hover:bg-visa-dark-gray/80 rounded-full w-10 h-10 p-0 flex items-center justify-center"
      >
        <Home size={20} />
      </Button>
      
      <div className="max-w-4xl mx-auto">
        <div className="form-container">
          <h1 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Global Talent Visa Assessment</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-white mb-2 font-medium">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="input-field"
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
                  className="input-field"
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
                  className="input-field"
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
                  className="input-field flex justify-between items-center"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className={visaType ? "text-white" : "text-gray-400"}>
                    {visaType || "Select visa type"}
                  </span>
                  <ChevronDown size={20} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-visa-dark-gray border border-visa-lilac/30 rounded-lg shadow-lg">
                    {["O-1A", "EB-1", "O-1B", "NIW", "Not sure which one to choose"].map((type) => (
                      <div
                        key={type}
                        className="px-4 py-3 hover:bg-visa-lilac/20 cursor-pointer"
                        onClick={() => {
                          setVisaType(type);
                          setDropdownOpen(false);
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
                className="file-upload-area"
                onDragOver={(e) => e.preventDefault()}
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
                <Upload size={36} className="text-blue-400 mb-3" />
                <p className="text-blue-400 mb-1">Drag & drop files here or click to browse</p>
                <p className="text-gray-400 text-sm">Accept PDF, DOC, JPG (up to 20MB each)</p>
              </div>
              
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Selected Files:</p>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-visa-dark-gray/70 p-2 rounded-lg">
                      <span className="truncate max-w-[80%]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-400 hover:text-red-300"
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
                  className="input-field pl-10"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
                <LinkIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400 mt-1">Add LinkedIn profile, professional website, portfolios, or press coverage</p>
            </div>
            
            <div className="border-t border-visa-lilac/20 pt-4">
              <button
                type="button"
                className="flex items-center justify-between w-full text-blue-400 hover:text-blue-300"
                onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
              >
                <span className="font-medium">Instructions & Document Types</span>
                {isInstructionsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {isInstructionsOpen && (
                <div className="mt-4 bg-visa-dark-gray/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Recommended Documents:</h3>
                  <ul className="space-y-1 text-gray-300">
                    <li>• Professional resume or CV</li>
                    <li>• Letters of recommendation</li>
                    <li>• Evidence of awards or recognition</li>
                    <li>• Published articles or media coverage</li>
                    <li>• Professional memberships</li>
                    <li>• Employment contracts or offer letters</li>
                  </ul>
                  <p className="mt-4 text-sm text-gray-400">
                    Submitting comprehensive documentation will help provide a more accurate assessment. 
                    All documents are processed securely and confidentially.
                  </p>
                </div>
              )}
            </div>
            
            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="gradient-btn flex items-center justify-center min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit for Evaluation"
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
