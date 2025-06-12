import formidable from 'formidable';
import fs from 'fs';
import mammoth from 'mammoth';
import { handleError, ERROR_CODES } from '../../lib/errorHandler.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFilePath = null;

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        suggestions: ['Please select a file to upload', 'Supported formats: TXT, PDF, DOC, DOCX']
      });
    }

    tempFilePath = file.filepath;
    const fileName = file.originalFilename || 'unknown';
    const mimeType = file.mimetype;
    const fileSize = file.size;

    // Validate file size
    if (fileSize > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit. Please compress your file or convert to TXT format.');
    }

    // Validate file type
    const supportedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!supportedTypes.includes(mimeType) && !fileName.match(/\.(txt|pdf|docx|doc)$/i)) {
      throw new Error('Unsupported file format. Please upload TXT, PDF, DOC, or DOCX files.');
    }

    let extractedText = '';

    try {
      if (mimeType === 'text/plain') {
        extractedText = await extractTextFile(tempFilePath);
      } else if (mimeType === 'application/pdf') {
        extractedText = await extractPDFText(tempFilePath, fileName);
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        extractedText = await extractWordText(tempFilePath);
      } else {
        throw new Error('Unsupported file format detected during processing.');
      }

      // Clean and validate the extracted text
      extractedText = cleanExtractedText(extractedText);

      if (!extractedText || extractedText.length < 50) {
        throw new Error('Could not extract readable text from the file. The file may be corrupted, password-protected, or contain only images.');
      }

      // Validate content quality
      if (!isValidResumeContent(extractedText)) {
        throw new Error('The extracted content doesn\'t appear to be a resume. Please ensure your file contains resume text.');
      }

      res.status(200).json({
        success: true,
        content: extractedText,
        fileName: fileName,
        fileType: mimeType,
        length: extractedText.length,
        quality: assessContentQuality(extractedText)
      });

    } catch (extractionError) {
      const jobMateError = handleError(extractionError, {
        operation: 'file_extraction',
        fileName,
        fileType: mimeType,
        fileSize
      });

      throw jobMateError;
    }

  } catch (error) {
    console.error('File processing error:', error);
    
    const jobMateError = handleError(error, {
      operation: 'file_processing'
    });

    res.status(500).json({
      error: jobMateError.message,
      code: jobMateError.code,
      suggestions: getSuggestionsForError(jobMateError.code),
      supportedFormats: [
        { format: 'TXT', description: 'Plain text (Recommended)', maxSize: '10MB' },
        { format: 'DOCX', description: 'Microsoft Word (2007+)', maxSize: '10MB' },
        { format: 'DOC', description: 'Microsoft Word (Legacy)', maxSize: '10MB' },
        { format: 'PDF', description: 'PDF Document (Limited support)', maxSize: '10MB' }
      ]
    });
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError);
      }
    }
  }
}

async function extractTextFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content || content.trim().length === 0) {
      throw new Error('Text file is empty or contains no readable content.');
    }
    return content;
  } catch (error) {
    throw new Error('Failed to read text file: ' + error.message);
  }
}

async function extractPDFText(filePath, fileName) {
  // Enhanced PDF handling with better error messages
  throw new Error(`PDF processing is currently limited. For best results, please:
1. Save your PDF as a Word document (.docx)
2. Copy the text and save as a .txt file
3. Use our web interface to paste the content directly

This ensures 100% accuracy in text extraction.`);
}

async function extractWordText(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content found in Word document. The file may contain only images or be corrupted.');
    }

    // Check for extraction warnings
    if (result.messages && result.messages.length > 0) {
      console.warn('Word extraction warnings:', result.messages);
    }

    return result.value;
  } catch (error) {
    if (error.message.includes('ENOENT')) {
      throw new Error('Word document file not found or corrupted.');
    } else if (error.message.includes('password')) {
      throw new Error('Password-protected Word documents are not supported. Please remove password protection and try again.');
    } else {
      throw new Error('Failed to extract text from Word document. The file may be corrupted or in an unsupported format.');
    }
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
    // Remove leading/trailing whitespace
    .trim();
}

function isValidResumeContent(text) {
  const resumeIndicators = [
    'experience', 'education', 'skills', 'work', 'employment',
    'university', 'college', 'degree', 'certification', 'project',
    'achievement', 'responsibility', 'objective', 'summary',
    'contact', 'email', 'phone', 'address', 'linkedin'
  ];

  const lowerText = text.toLowerCase();
  const foundIndicators = resumeIndicators.filter(indicator => 
    lowerText.includes(indicator)
  );

  // Should have at least 3 resume indicators and reasonable length
  return foundIndicators.length >= 3 && text.length >= 100;
}

function assessContentQuality(text) {
  const wordCount = text.split(/\s+/).length;
  const lineCount = text.split('\n').length;
  
  if (wordCount > 300 && lineCount > 10) {
    return 'excellent';
  } else if (wordCount > 150 && lineCount > 5) {
    return 'good';
  } else if (wordCount > 50) {
    return 'fair';
  } else {
    return 'poor';
  }
}

function getSuggestionsForError(errorCode) {
  const suggestions = {
    [ERROR_CODES.FILE_TOO_LARGE]: [
      'Compress your file or convert to TXT format',
      'Remove unnecessary images or formatting',
      'Split large files into smaller sections'
    ],
    [ERROR_CODES.UNSUPPORTED_FORMAT]: [
      'Convert your file to TXT, DOCX, or DOC format',
      'Save as plain text for best compatibility',
      'Ensure file extension matches content type'
    ],
    [ERROR_CODES.EXTRACTION_FAILED]: [
      'Try saving your file as plain text (.txt)',
      'Remove password protection if present',
      'Ensure the file contains actual text content',
      'Copy and paste content directly into our web interface'
    ],
    [ERROR_CODES.FILE_CORRUPTED]: [
      'Try re-saving the file in the same format',
      'Convert to a different supported format',
      'Check if the original file opens correctly'
    ]
  };

  return suggestions[errorCode] || [
    'Try uploading a different file format',
    'Ensure your file contains readable text',
    'Contact support if the issue persists'
  ];
}