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

    // Helper functions for structured layout
    const checkPageBreak = (neededSpace: number = 20) => {
      if (currentY + neededSpace > pageHeight - 40) {
        pdf.addPage();
        // Apply dark background to new page
        pdf.setFillColor(12, 10, 4);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        currentY = 30;
        return true;
      }
      return false;
    };

    const addSection = (title: string, score?: string) => {
      checkPageBreak(25);
      
      // Section background - Dark gray (#333333)
      pdf.setFillColor(51, 51, 51); // #333333
      pdf.rect(margin, currentY - 2, contentWidth, 15, 'F');
      
      // Section title - Bold uppercase gold (#FFD700)
      pdf.setTextColor(255, 215, 0); // #FFD700
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const sectionText = score ? `${title.toUpperCase()} (${score})` : title.toUpperCase();
      pdf.text(sectionText, margin + 3, currentY + 8);
      
      currentY += 20;
    };

    const addParagraph = (text: string, fontSize: number = 10, color: 'white' | 'gold' | 'light' | 'lightgold' = 'white', style: 'normal' | 'bold' | 'italic' = 'normal', indent: number = 0) => {
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
      
      // Calculate safe text width with proper margins and indentation
      const textWidth = contentWidth - indent - 5; // 5mm additional safety margin
      const lines = pdf.splitTextToSize(text.trim(), textWidth);
      
      // Check if we need page break
      const neededSpace = lines.length * (fontSize * 0.35) + 5;
      checkPageBreak(neededSpace);
      
      // Add text with proper positioning
      pdf.text(lines, margin + indent, currentY);
      currentY += neededSpace;
    };

    const addBulletPoint = (text: string, fontSize: number = 10, color: 'white' | 'light' = 'white', indent: number = 10) => {
      addParagraph(`• ${text}`, fontSize, color, 'normal', indent);
    };

    const addSubheading = (text: string, score?: string) => {
      checkPageBreak(15);
      currentY += 8; // Add spacing before subheading
      
      const fullText = score ? `${text} (${score})` : text;
      addParagraph(fullText, 11, 'lightgold', 'bold', 5);
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
    addSection('EVALUATION SCORE');
    
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
    
    addParagraph(interpretation, 10, 'light');
    currentY += 30;

    // DETAILED OVERVIEW SECTION
    addSection('DETAILED EVALUATION OVERVIEW');
    
    // Parse and format the overview content with improved header detection
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
      
      // Detect summary section
      if (line.toLowerCase().includes('summary') && line.includes(':')) {
        inSummary = true;
        addSection('SUMMARY');
        continue;
      }
      
      // Process summary content
      if (inSummary && !(/^(Awards|Memberships|Media|Employment|Profile|Judging|High\s+Salary|Extraordinary)/i.test(line))) {
        addParagraph(line, 10, 'white');
        continue;
      } else {
        inSummary = false;
      }
      
      // Enhanced section header detection - matches patterns like "Employment in Critical Capacity (15/25)"
      const sectionHeaderMatch = line.match(/^(.*?(?:Employment|Membership|Awards?|Media|Profile|Judging|High\s+Salary|Extraordinary).*?)\s*\(([^)]+)\)/i);
      if (sectionHeaderMatch) {
        const sectionName = sectionHeaderMatch[1].trim();
        const score = sectionHeaderMatch[2];
        addSection(sectionName, score);
        continue;
      }
      
      // Simple section headers without scores
      if (/^(Awards|Memberships|Media|Employment|Profile|Summary)/i.test(line) && !line.includes('(')) {
        addSection(line);
        continue;
      }
      
      // Handle special notes like "High Salary (0/25)" as subheadings
      const subheadingMatch = line.match(/^(.+?)\s*\((\d+\/\d+)\)$/);
      if (subheadingMatch && !line.toLowerCase().includes('you have') && !line.toLowerCase().includes('you need')) {
        const noteText = subheadingMatch[1];
        const score = subheadingMatch[2];
        addSubheading(noteText, score);
        continue;
      }
      
      // Bullet points and regular content
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('\'')) {
        const bulletText = line.replace(/^[•\-\']\s*/, '').trim();
        
        // Check for "You have:" or "You need:" patterns
        if (bulletText.toLowerCase().startsWith('you have:')) {
          const content = bulletText.substring(9).trim();
          addParagraph('You have:', 10, 'white', 'bold', 10);
          addParagraph(content, 10, 'white', 'normal', 15);
        } else if (bulletText.toLowerCase().startsWith('you need:')) {
          const content = bulletText.substring(9).trim();
          addParagraph('You need:', 10, 'lightgold', 'bold', 10);
          addParagraph(content, 10, 'white', 'normal', 15);
        } else {
          addBulletPoint(bulletText, 10, 'light', 10);
        }
      } else {
        // Regular paragraph text
        addParagraph(line, 10, 'light', 'normal', 5);
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