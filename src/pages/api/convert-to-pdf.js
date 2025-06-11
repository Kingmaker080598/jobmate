import { jsPDF } from 'jspdf';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content, filename = 'resume' } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    // Split content into lines that fit the page width
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - (margin * 2);
    
    const lines = doc.splitTextToSize(content, maxLineWidth);
    
    // Add text to PDF with proper pagination
    let yPosition = margin;
    const lineHeight = 6;
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxYPosition = pageHeight - margin;
    
    lines.forEach((line) => {
      if (yPosition > maxYPosition) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    
    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF
    res.status(200).send(pdfBuffer);
    
  } catch (error) {
    console.error('PDF conversion error:', error);
    res.status(500).json({ error: 'Failed to convert to PDF' });
  }
}