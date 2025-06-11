import { Document, Packer, Paragraph, TextRun } from 'docx';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content, filename = 'resume' } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    // Split content into paragraphs
    const paragraphs = content.split('\n').map(line => {
      return new Paragraph({
        children: [
          new TextRun({
            text: line || ' ', // Empty line if no content
            font: 'Calibri',
            size: 22, // 11pt font
          }),
        ],
        spacing: {
          after: 120, // 6pt spacing after paragraph
        },
      });
    });

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    // Generate DOCX buffer
    const buffer = await Packer.toBuffer(doc);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.docx"`);
    res.setHeader('Content-Length', buffer.length);
    
    // Send DOCX
    res.status(200).send(buffer);
    
  } catch (error) {
    console.error('DOCX conversion error:', error);
    res.status(500).json({ error: 'Failed to convert to DOCX' });
  }
}