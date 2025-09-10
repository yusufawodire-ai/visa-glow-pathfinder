import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface UserData {
  name: string;
  email: string;
  visaType: string;
  documents?: string[];
}

interface EvaluationData {
  score: string | number;
  overview: string;
  evaluationId?: string | number;
}

export const generateEvaluationPDF = async (
  evaluationData: EvaluationData,
  userData: UserData
): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let currentY = 20;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * (fontSize * 0.35) + 2);
    };

    // Header
    pdf.setFillColor(235, 194, 80); // visa-gold color
    pdf.rect(0, 0, pageWidth, 15, 'F');
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sherrod Sports Visas - Evaluation Report', 20, 10);
    
    currentY = 30;

    // Date
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 60, currentY);
    currentY += 15;

    // Applicant Information Section
    pdf.setTextColor(235, 194, 80); // visa-gold
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Applicant Information', 20, currentY);
    currentY += 8;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    currentY = addWrappedText(`Name: ${userData.name}`, 25, currentY, pageWidth - 50, 11);
    currentY = addWrappedText(`Email: ${userData.email}`, 25, currentY, pageWidth - 50, 11);
    currentY = addWrappedText(`Visa Type: ${userData.visaType}`, 25, currentY, pageWidth - 50, 11);
    
    if (userData.documents && userData.documents.length > 0) {
      currentY = addWrappedText(`Documents Submitted: ${userData.documents.length} file(s)`, 25, currentY, pageWidth - 50, 11);
    }
    
    currentY += 10;

    // Evaluation Score Section
    pdf.setTextColor(235, 194, 80); // visa-gold
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Evaluation Score', 20, currentY);
    currentY += 8;

    // Score display
    const scoreText = typeof evaluationData.score === 'string' ? evaluationData.score : `${evaluationData.score}%`;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Success Rate: ${scoreText}`, 25, currentY);
    currentY += 15;

    // Overview Section
    pdf.setTextColor(235, 194, 80); // visa-gold
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Evaluation Overview', 20, currentY);
    currentY += 8;

    // Clean up and format the overview text for PDF
    let cleanOverview = evaluationData.overview;
    
    // Remove markdown formatting
    cleanOverview = cleanOverview.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold
    cleanOverview = cleanOverview.replace(/\*(.*?)\*/g, '$1'); // Remove italic
    cleanOverview = cleanOverview.replace(/^#{1,6}\s*/gm, ''); // Remove headers
    
    // Split into paragraphs and clean up
    const paragraphs = cleanOverview.split('\n').filter(line => line.trim());
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    for (const paragraph of paragraphs) {
      if (paragraph.trim()) {
        // Check if we need a new page
        if (currentY > pageHeight - 30) {
          pdf.addPage();
          currentY = 20;
        }

        const trimmedParagraph = paragraph.trim();
        
        // Check if this is a section header (starts with emoji or contains specific keywords)
        if (/^[🏆👥📰💼🎯✅❌⚠️]/.test(trimmedParagraph) || 
            /^(Summary|Awards|Memberships|Media|Employment|Profile)/i.test(trimmedParagraph)) {
          // Section header styling
          pdf.setTextColor(235, 194, 80); // visa-gold
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          currentY = addWrappedText(trimmedParagraph, 20, currentY, pageWidth - 40, 12);
          currentY += 3;
        } else {
          // Regular content styling
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          
          // Handle bullet points
          if (trimmedParagraph.startsWith('•') || trimmedParagraph.startsWith('-')) {
            currentY = addWrappedText(trimmedParagraph.replace(/^[•-]\s*/, '• '), 25, currentY, pageWidth - 50, 10);
          } else {
            currentY = addWrappedText(trimmedParagraph, 25, currentY, pageWidth - 50, 10);
          }
          currentY += 2;
        }
      }
    }

    // Footer
    const footerY = pageHeight - 15;
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(8);
    pdf.text('This evaluation is for informational purposes only. Consult with immigration professionals for official guidance.', 20, footerY);

    // Generate filename
    const cleanName = userData.name.replace(/[^a-zA-Z0-9]/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const filename = `Visa_Evaluation_${cleanName}_${date}.pdf`;

    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF document');
  }
};

export const getUserDataFromStorage = (): UserData | null => {
  try {
    // Try different storage keys where user data might be stored
    let userData = sessionStorage.getItem('userData');
    let parsed = null;
    
    if (userData) {
      parsed = JSON.parse(userData);
    } else {
      // Check if data is stored under different keys
      const formData = sessionStorage.getItem('formData');
      const inputData = sessionStorage.getItem('inputData');
      
      if (formData) {
        parsed = JSON.parse(formData);
      } else if (inputData) {
        parsed = JSON.parse(inputData);
      } else {
        // Try to get data from URL params or other sources
        console.log('No user data found in sessionStorage');
        return {
          name: 'Applicant',
          email: 'Not provided',
          visaType: 'Not specified',
          documents: []
        };
      }
    }
    
    return {
      name: parsed?.name || parsed?.fullName || 'Applicant',
      email: parsed?.email || 'Not provided',
      visaType: parsed?.visaType || parsed?.visa_type || 'Not specified',
      documents: parsed?.documents || parsed?.files || []
    };
  } catch (error) {
    console.error('Error retrieving user data:', error);
    // Return fallback data instead of null to prevent the error
    return {
      name: 'Applicant',
      email: 'Not provided', 
      visaType: 'Not specified',
      documents: []
    };
  }
};