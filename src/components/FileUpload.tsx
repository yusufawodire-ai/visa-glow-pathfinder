
import React, { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles }) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Check if adding these files would exceed the 5 file limit
    if (files.length + newFiles.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 5 documents",
        variant: "destructive",
      });
      return;
    }
    
    const validFiles = validateFiles(newFiles);
    
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

  const validateFiles = (newFiles: File[]) => {
    return newFiles.filter(file => {
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
    
    // Check if adding these files would exceed the 5 file limit
    if (files.length + newFiles.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 5 documents",
        variant: "destructive",
      });
      return;
    }
    
    const validFiles = validateFiles(newFiles);
    
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

  return (
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
        <p className="text-gray-400 text-sm mt-1">Maximum 5 documents allowed</p>
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
                <span className="truncate max-w-[80%] text-white">{file.name}</span>
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
  );
};

export default FileUpload;
