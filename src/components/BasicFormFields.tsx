
import React from 'react';
import { LinkIcon, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormFieldsProps {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  visaType: string;
  setVisaType: React.Dispatch<React.SetStateAction<string>>;
  link: string;
  setLink: React.Dispatch<React.SetStateAction<string>>;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const BasicFormFields: React.FC<FormFieldsProps> = ({
  name, setName,
  email, setEmail,
  phone, setPhone,
  visaType, setVisaType,
  link, setLink,
  dropdownOpen, setDropdownOpen
}) => {
  const { toast } = useToast();
  
  // Updated list of specific visa types
  const visaTypes = ["O-1A", "P-1A", "EB-1A", "O-1B", "P-1B", "O-2", "P-1S"];
  
  return (
    <>
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
              {visaTypes.map((type) => (
                <div
                  key={type}
                  className="px-4 py-3 text-white hover:bg-visa-lilac/20 cursor-pointer transition-colors duration-200"
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
                  <div className="flex flex-col">
                    <span>{type}</span>
                    {(type === "O-2" || type === "P-1S") && (
                      <span className="text-xs text-gray-400 mt-1">
                        (Note: Verify you have a qualified relevant principal visa holder before evaluating.)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="link" className="block text-white mb-2 font-medium">Relevant Links <span className="text-gray-400">(Optional)</span></label>
        <div className="relative">
          <input
            id="link"
            type="text"
            placeholder="Personal website, articles, press coverage, etc. (No social media account or profile link)"
            className="input-field pl-10 transition-all duration-300 focus:shadow-[0_0_15px_rgba(167,139,250,0.5)]"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <LinkIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
        </div>
        <p className="text-sm text-white mt-1">Add professional website, portfolios, or press coverage (please do not include social media account or profile link)</p>
      </div>
    </>
  );
};

export default BasicFormFields;
