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

    // Clean up the overview text - remove markdown formatting for PDF
    let cleanOverview = evaluationData.overview;
    
    // Remove markdown headers and format them
    cleanOverview = cleanOverview.replace(/^### (.*$)/gm, '\n$1:\n');
    cleanOverview = cleanOverview.replace(/^## (.*$)/gm, '\n$1:\n');
    cleanOverview = cleanOverview.replace(/^# (.*$)/gm, '\n$1:\n');
    
    // Remove markdown bold/italic
    cleanOverview = cleanOverview.replace(/\*\*(.*?)\*\*/g, '$1');
    cleanOverview = cleanOverview.replace(/\*(.*?)\*/g, '$1');
    
    // Remove markdown lists and clean up
    cleanOverview = cleanOverview.replace(/^- /gm, '• ');
    cleanOverview = cleanOverview.replace(/^\d+\. /gm, '• ');
    
    // Split into sections and format
    const sections = cleanOverview.split(/(?=🏆|👥|📰|💼|🎯|✅|❌|⚠️)/);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    for (const section of sections) {
      if (section.trim()) {
        // Check if we need a new page
        if (currentY > pageHeight - 40) {
          pdf.addPage();
          currentY = 20;
        }

        // If this looks like a section header (starts with emoji)
        if (/^[🏆👥📰💼🎯✅❌⚠️]/.test(section.trim())) {
          const lines = section.trim().split('\n');
          const headerLine = lines[0];
          const content = lines.slice(1).join('\n');

          // Section header in gold
          pdf.setTextColor(235, 194, 80);
          pdf.setFont('helvetica', 'bold');
          currentY = addWrappedText(headerLine, 20, currentY, pageWidth - 40, 11);
          
          // Section content in black
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          if (content.trim()) {
            currentY = addWrappedText(content.trim(), 25, currentY, pageWidth - 50, 10);
          }
        } else {
          currentY = addWrappedText(section.trim(), 25, currentY, pageWidth - 50, 10);
        }
        
        currentY += 5;
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
    const userData = sessionStorage.getItem('userData');
    if (!userData) return null;
    
    const parsed = JSON.parse(userData);
    return {
      name: parsed.name || 'Unknown',
      email: parsed.email || 'Unknown',
      visaType: parsed.visaType || 'Unknown',
      documents: parsed.documents || []
    };
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};