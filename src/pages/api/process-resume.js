import formidable from 'formidable';
import fs from 'fs';
import mammoth from 'mammoth';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = file.filepath;
    const fileName = file.originalFilename || 'unknown';
    const mimeType = file.mimetype;

    let extractedText = '';

    try {
      if (mimeType === 'text/plain') {
        // Handle plain text files
        extractedText = fs.readFileSync(filePath, 'utf8');
      } else if (mimeType === 'application/pdf') {
        // Handle PDF files - simplified approach
        extractedText = await extractPDFTextSimple(filePath);
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        // Handle Word documents
        extractedText = await extractWordText(filePath);
      } else {
        throw new Error('Unsupported file format. Please use TXT, PDF, or DOCX files.');
      }

      // Clean and validate the extracted text
      extractedText = cleanExtractedText(extractedText);

      if (!extractedText || extractedText.length < 50) {
        throw new Error('Could not extract readable text from the file. Please ensure your file contains text content.');
      }

      // Clean up the temporary file
      fs.unlinkSync(filePath);

      res.status(200).json({
        success: true,
        content: extractedText,
        fileName: fileName,
        fileType: mimeType,
        length: extractedText.length
      });

    } catch (extractionError) {
      // Clean up the temporary file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw extractionError;
    }

  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({
      error: 'Failed to process file',
      details: error.message
    });
  }
}

async function extractPDFTextSimple(filePath) {
  // For now, we'll provide a fallback message for PDF files
  // In a production environment, you'd want to use a proper PDF parsing library
  throw new Error('PDF processing requires additional setup. Please convert your PDF to TXT format or use a DOCX file for now.');
}

async function extractWordText(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content found in Word document');
    }

    return result.value;
  } catch (error) {
    throw new Error('Failed to extract text from Word document: ' + error.message);
  }
}

function cleanExtractedText(text) {
  if (!text) return '';

  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters that might interfere
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove multiple consecutive line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}