import formidable from 'formidable';
import fs from 'fs';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { handleError, ERROR_CODES } from '../../lib/errorHandler.js';
import { supabase } from '../../lib/supabaseClient.js';

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

    console.log('Processing file:', { fileName, mimeType, fileSize });

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
        mimeType === 'application/msword' ||
        fileName.toLowerCase().endsWith('.docx') ||
        fileName.toLowerCase().endsWith('.doc')
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
        console.warn('Content may not be a resume, but proceeding with extraction');
      }

      // Get user session to save to database
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('Saving extracted content to database for user:', session.user.id);
        
        // Save the extracted content to resume_history table
        const { error: saveError } = await supabase
          .from('resume_history')
          .insert({
            user_id: session.user.id,
            job_title: fileName.replace(/\.[^/.]+$/, ''), // Remove file extension
            content: extractedText, // Store the extracted text content
            file_name: fileName,
            file_type: mimeType,
            created_at: new Date().toISOString()
          });

        if (saveError) {
          console.error('Error saving to database:', saveError);
          // Don't fail the request if database save fails
        } else {
          console.log('Successfully saved extracted content to database');
        }
      }

      res.status(200).json({
        success: true,
        content: extractedText,
        fileName: fileName,
        fileType: mimeType,
        length: extractedText.length,
        quality: assessContentQuality(extractedText),
        message: 'Resume content extracted and saved successfully'
      });

    } catch (extractionError) {
      console.error('Extraction error:', extractionError);
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
        { format: 'PDF', description: 'PDF Document', maxSize: '10MB' }
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
  try {
    console.log('Extracting text from PDF document:', filePath);
    
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    console.log('PDF extraction result:', {
      hasText: !!data.text,
      textLength: data.text?.length || 0,
      numPages: data.numpages || 0
    });
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text content found in PDF document. The file may contain only images, be corrupted, or be password-protected.');
    }

    console.log('Successfully extracted text from PDF document, length:', data.text.length);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    
    if (error.message.includes('ENOENT')) {
      throw new Error('PDF document file not found or corrupted.');
    } else if (error.message.includes('password')) {
      throw new Error('Password-protected PDF documents are not supported. Please remove password protection and try again.');
    } else if (error.message.includes('Invalid PDF')) {
      throw new Error('The PDF document appears to be corrupted or invalid. Please try saving it again or converting to TXT format.');
    } else {
      throw new Error('Failed to extract text from PDF document. The file may be corrupted, in an unsupported format, or contain only images. For best results, try converting to DOCX or TXT format.');
    }
  }
}

async function extractWordText(filePath) {
  try {
    console.log('Extracting text from Word document:', filePath);
    
    const result = await mammoth.extractRawText({ path: filePath });
    
    console.log('Mammoth extraction result:', {
      hasValue: !!result.value,
      valueLength: result.value?.length || 0,
      messagesCount: result.messages?.length || 0
    });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content found in Word document. The file may contain only images, be corrupted, or be password-protected.');
    }

    // Check for extraction warnings
    if (result.messages && result.messages.length > 0) {
      console.warn('Word extraction warnings:', result.messages);
      // Don't fail on warnings, just log them
    }

    console.log('Successfully extracted text from Word document, length:', result.value.length);
    return result.value;
  } catch (error) {
    console.error('Word extraction error:', error);
    
    if (error.message.includes('ENOENT')) {
      throw new Error('Word document file not found or corrupted.');
    } else if (error.message.includes('password')) {
      throw new Error('Password-protected Word documents are not supported. Please remove password protection and try again.');
    } else if (error.message.includes('not a valid zip file')) {
      throw new Error('The Word document appears to be corrupted. Please try saving it again or converting to TXT format.');
    } else {
      throw new Error('Failed to extract text from Word document. The file may be corrupted, in an unsupported format, or contain only images. Try converting to TXT format.');
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

  // Should have at least 2 resume indicators and reasonable length
  return foundIndicators.length >= 2 && text.length >= 50;
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