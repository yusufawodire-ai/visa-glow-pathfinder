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
    const margin = 25.4; // 1 inch margins as per guide
    const contentWidth = pageWidth - (margin * 2);
    let currentY = 0;

    // Dark background for entire page
    pdf.setFillColor(12, 10, 4); // Dark background like website (#0C0A04)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Helper functions
    const addSection = (title: string, y: number, score?: string) => {
      // Section background - Dark gray (#333333)
      pdf.setFillColor(51, 51, 51); // #333333
      pdf.rect(margin, y - 2, contentWidth, 15, 'F');
      
      // Section title - Bold uppercase gold (#FFD700)
      pdf.setTextColor(255, 215, 0); // #FFD700
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const sectionText = score ? `${title.toUpperCase()} (${score})` : title.toUpperCase();
      pdf.text(sectionText, margin + 3, y + 8);
      
      return y + 20;
    };

    const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10, color: 'white' | 'gold' | 'light' | 'lightgold' = 'white', style: 'normal' | 'bold' | 'italic' = 'normal') => {
      // Set colors based on theme
      if (color === 'white') {
        pdf.setTextColor(255, 255, 255);
      } else if (color === 'gold') {
        pdf.setTextColor(255, 215, 0); // #FFD700
      } else if (color === 'light') {
        pdf.setTextColor(200, 200, 200);
      } else if (color === 'lightgold') {
        pdf.setTextColor(255, 213, 128); // #FFD580
      }
      
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', style);
      
      // Ensure maxWidth doesn't exceed page boundaries
      const safeMaxWidth = Math.min(maxWidth, pageWidth - margin - x - 5);
      const lines = pdf.splitTextToSize(text, safeMaxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * (fontSize * 0.35)) + 3;
    };

    const addBoldText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10, color: 'white' | 'gold' | 'lightgold' = 'white') => {
      return addText(text, x, y, maxWidth, fontSize, color, 'bold');
    };

    // HEADER SECTION
    currentY = 15;
    
    // Main header background
    pdf.setFillColor(235, 194, 80); // visa-gold
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    // Company logo/title
    pdf.setTextColor(0, 0, 0); // Black text on gold background
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SHERROD SPORTS VISAS', margin, 22);
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Evaluation Report', margin, 32);
    
    // Date
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 60, 32);
    
    currentY = 70;

    // EVALUATION SCORE SECTION
    currentY = addSection('EVALUATION SCORE', currentY);
    
    // Score display with visual emphasis
    const scoreText = typeof evaluationData.score === 'string' ? evaluationData.score : `${evaluationData.score}%`;
    const scoreNum = parseFloat(scoreText.replace('%', ''));
    
    // Score background box
    pdf.setFillColor(106, 78, 127, 0.2); // visa-lilac with transparency
    pdf.rect(margin, currentY, contentWidth / 2, 35, 'F');
    
    // Large score text
    pdf.setTextColor(255, 215, 0); // #FFD700
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SUCCESS RATE', margin + 5, currentY + 12);
    
    pdf.setFontSize(32);
    pdf.text(scoreText, margin + 5, currentY + 28);
    
    // Score interpretation
    let interpretation = '';
    if (scoreNum >= 70) {
      interpretation = 'Excellent prospects for visa approval';
    } else if (scoreNum >= 50) {
      interpretation = 'Good chances with proper preparation';
    } else if (scoreNum >= 30) {
      interpretation = 'Moderate chances, enhancement needed';
    } else {
      interpretation = 'Significant improvement required';
    }
    
    currentY = addText(interpretation, margin + (contentWidth / 2) + 10, currentY + 15, contentWidth / 2, 10, 'light');
    currentY += 45;

    // DETAILED OVERVIEW SECTION
    currentY = addSection('DETAILED EVALUATION OVERVIEW', currentY);
    
    // Parse and format the overview content
    let cleanOverview = evaluationData.overview
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/^#{1,6}\s*/gm, ''); // Remove headers
    
    // Process the text to create proper structure
    const lines = cleanOverview.split('\n').filter(line => line.trim());
    let inSummary = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;
      
      // Check if we need a new page
      if (currentY > pageHeight - 40) {
        pdf.addPage();
        // Apply dark background to new page
        pdf.setFillColor(12, 10, 4);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        currentY = 20;
      }
      
      // Detect summary section
      if (line.toLowerCase().includes('summary') && line.includes(':')) {
        inSummary = true;
        currentY = addSection('SUMMARY', currentY);
        continue;
      }
      
      // Process summary content
      if (inSummary && !(/^(Awards|Memberships|Media|Employment|Profile)/i.test(line))) {
        currentY = addText(line, margin, currentY, contentWidth, 10, 'white');
        continue;
      } else {
        inSummary = false;
      }
      
      // Section headers (Awards, Memberships, etc.)
      if (/^(Awards|Memberships|Media|Employment|Profile)/i.test(line)) {
        currentY += 8; // Add spacing before new section
        
        // Extract section name and score if present
        const sectionMatch = line.match(/^(.*?)\s*\(([^)]+)\)/);
        if (sectionMatch) {
          const sectionName = sectionMatch[1].trim();
          const score = sectionMatch[2];
          currentY = addSection(sectionName, currentY, score);
        } else {
          // Simple section header
          currentY = addSection(line, currentY);
        }
        continue;
      }
      
      // Handle special notes like "High Salary (0/25)"
      const specialNoteMatch = line.match(/^(.+?)\s*\((\d+\/\d+)\)$/);
      if (specialNoteMatch && !line.toLowerCase().includes('you have') && !line.toLowerCase().includes('you need')) {
        const noteText = specialNoteMatch[1];
        const score = specialNoteMatch[2];
        currentY = addText(`${noteText} (${score})`, margin + 5, currentY, contentWidth - 10, 9, 'light', 'italic');
        continue;
      }
      
      // Bullet points and regular content
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('\'')) {
        const bulletText = line.replace(/^[•\-\']\s*/, '').trim();
        
        // Check for "You have:" or "You need:" patterns
        if (bulletText.toLowerCase().startsWith('you have:')) {
          const content = bulletText.substring(9).trim();
          currentY = addBoldText('You have:', margin + 10, currentY, contentWidth - 20, 10, 'white');
          currentY = addText(content, margin + 15, currentY, contentWidth - 25, 10, 'white');
        } else if (bulletText.toLowerCase().startsWith('you need:')) {
          const content = bulletText.substring(9).trim();
          currentY = addBoldText('You need:', margin + 10, currentY, contentWidth - 20, 10, 'lightgold');
          currentY = addText(content, margin + 15, currentY, contentWidth - 25, 10, 'white');
        } else {
          currentY = addText('• ' + bulletText, margin + 10, currentY, contentWidth - 20, 10, 'light');
        }
      } else {
        // Regular paragraph text
        currentY = addText(line, margin + 5, currentY, contentWidth - 10, 10, 'light');
      }
    }

    // FOOTER - Fixed formatting
    currentY = Math.max(currentY + 15, pageHeight - 25);
    
    // Footer background
    pdf.setFillColor(255, 215, 0); // Gold footer (#FFD700)
    pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    
    // Footer text - left side
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    const disclaimerText = 'This evaluation is for informational purposes only. Consult with immigration professionals for official guidance.';
    const disclaimerLines = pdf.splitTextToSize(disclaimerText, pageWidth - 120); // Conservative width for company name space
    pdf.text(disclaimerLines, margin, pageHeight - 12);
    
    // Footer text - right side (company name)
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sherrod Sports Visas © 2025', pageWidth - 65, pageHeight - 8);

    // Generate filename with timestamp
    const date = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toTimeString().slice(0, 5).replace(':', '');
    const filename = `Visa_Evaluation_Report_${date}_${timestamp}.pdf`;

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