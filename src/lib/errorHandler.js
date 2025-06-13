// Enhanced error handling utilities
export class JobMateError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'JobMateError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export const ERROR_CODES = {
  // API Errors
  OPENAI_QUOTA_EXCEEDED: 'OPENAI_QUOTA_EXCEEDED',
  OPENAI_CONNECTION_ERROR: 'OPENAI_CONNECTION_ERROR',
  OPENAI_INVALID_REQUEST: 'OPENAI_INVALID_REQUEST',
  
  // File Processing Errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  FILE_CORRUPTED: 'FILE_CORRUPTED',
  EXTRACTION_FAILED: 'EXTRACTION_FAILED',
  PDF_PROCESSING_LIMITED: 'PDF_PROCESSING_LIMITED',
  DOCX_PROCESSING_ERROR: 'DOCX_PROCESSING_ERROR',
  
  // Database Errors
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Validation Errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // General Errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.OPENAI_QUOTA_EXCEEDED]: {
    title: 'AI Service Temporarily Unavailable',
    message: 'Our AI service is experiencing high demand. We\'ve activated our backup system to continue serving you.',
    action: 'Using enhanced fallback processing...',
    severity: 'warning'
  },
  [ERROR_CODES.OPENAI_CONNECTION_ERROR]: {
    title: 'AI Connection Issue',
    message: 'Temporary connection issue with our AI service. Switching to backup processing.',
    action: 'Retrying with enhanced stability...',
    severity: 'warning'
  },
  [ERROR_CODES.FILE_TOO_LARGE]: {
    title: 'File Size Too Large',
    message: 'Please upload a file smaller than 10MB for optimal processing.',
    action: 'Try compressing your file or converting to TXT format.',
    severity: 'error'
  },
  [ERROR_CODES.UNSUPPORTED_FORMAT]: {
    title: 'Unsupported File Format',
    message: 'We support TXT, PDF, DOC, and DOCX files for the best experience.',
    action: 'Please convert your file to a supported format.',
    severity: 'error'
  },
  [ERROR_CODES.PDF_PROCESSING_LIMITED]: {
    title: 'PDF Processing Limitation',
    message: 'We\'re currently experiencing limitations with PDF text extraction. For the best results, please convert your PDF to DOCX or TXT format, or copy and paste your resume content directly.',
    action: 'Try converting to DOCX/TXT or paste content directly.',
    severity: 'warning'
  },
  [ERROR_CODES.DOCX_PROCESSING_ERROR]: {
    title: 'Word Document Processing Issue',
    message: 'We encountered an issue processing your Word document. This may be due to file corruption, password protection, or unsupported formatting.',
    action: 'Try re-saving the file or converting to TXT format.',
    severity: 'error'
  },
  [ERROR_CODES.EXTRACTION_FAILED]: {
    title: 'Content Extraction Issue',
    message: 'We couldn\'t extract text from your file. This might be due to formatting or encryption.',
    action: 'Try saving your file as a plain text (.txt) document.',
    severity: 'error'
  },
  [ERROR_CODES.NETWORK_ERROR]: {
    title: 'Connection Issue',
    message: 'We\'re experiencing connectivity issues. Your data is safe.',
    action: 'Retrying automatically...',
    severity: 'warning'
  },
  [ERROR_CODES.UNAUTHORIZED]: {
    title: 'Authentication Required',
    message: 'Please sign in to continue using JobMate\'s features.',
    action: 'Redirecting to login...',
    severity: 'info'
  },
  [ERROR_CODES.UNKNOWN_ERROR]: {
    title: 'Something Went Wrong',
    message: 'We encountered an unexpected issue. Our team has been notified.',
    action: 'Please try again in a moment.',
    severity: 'error'
  }
};

export function handleError(error, context = {}) {
  // Determine error code first
  let errorCode = ERROR_CODES.UNKNOWN_ERROR;
  
  if (error.status === 429 || error.message.includes('quota')) {
    errorCode = ERROR_CODES.OPENAI_QUOTA_EXCEEDED;
  } else if (error.message.includes('socket hang up') || 
             error.message.includes('Connection error') ||
             error.message.includes('FetchError') ||
             error.code === 'ECONNRESET' ||
             error.code === 'ENOTFOUND') {
    errorCode = ERROR_CODES.OPENAI_CONNECTION_ERROR;
  } else if (error.message.includes('File size')) {
    errorCode = ERROR_CODES.FILE_TOO_LARGE;
  } else if (error.message.includes('Unsupported') || error.message.includes('format')) {
    errorCode = ERROR_CODES.UNSUPPORTED_FORMAT;
  } else if (error.message.includes('Word document') && 
             (error.message.includes('corrupted') || 
              error.message.includes('password') || 
              error.message.includes('not a valid zip'))) {
    errorCode = ERROR_CODES.DOCX_PROCESSING_ERROR;
  } else if (error.message.includes('PDF document') && 
             (error.message.includes('corrupted') || 
              error.message.includes('password') || 
              error.message.includes('Invalid PDF'))) {
    errorCode = ERROR_CODES.PDF_PROCESSING_LIMITED;
  } else if (error.message.includes('No readable resume content available') || 
             (error.message.includes('extract') && context.operation === 'resume_tailoring')) {
    errorCode = ERROR_CODES.PDF_PROCESSING_LIMITED;
  } else if (error.message.includes('extract') || error.message.includes('readable')) {
    errorCode = ERROR_CODES.EXTRACTION_FAILED;
  } else if (error.message.includes('network') || error.message.includes('fetch')) {
    errorCode = ERROR_CODES.NETWORK_ERROR;
  } else if (error.status === 401 || error.message.includes('unauthorized')) {
    errorCode = ERROR_CODES.UNAUTHORIZED;
  }

  // Only log detailed errors for non-connection issues or if it's the final attempt
  const isConnectionError = errorCode === ERROR_CODES.OPENAI_CONNECTION_ERROR;
  const isFinalAttempt = context.isFinalAttempt || false;
  
  if (!isConnectionError || isFinalAttempt) {
    // For connection errors on final attempt, use warning level since fallback is used
    const logLevel = (isConnectionError && isFinalAttempt) ? 'warn' : 'error';
    
    console[logLevel]('JobMate Error:', {
      error: error.message,
      code: errorCode,
      context,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  } else {
    // For connection errors during retries, use info level logging
    console.info('JobMate Connection Retry:', {
      attempt: context.attempt || 'unknown',
      operation: context.operation,
      message: 'Retrying due to connection issue...'
    });
  }

  return new JobMateError(
    ERROR_MESSAGES[errorCode]?.message || error.message,
    errorCode,
    { originalError: error, context }
  );
}

export function getErrorDisplay(error) {
  const errorInfo = ERROR_MESSAGES[error.code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
  
  return {
    ...errorInfo,
    code: error.code,
    details: error.details
  };
}

// Retry mechanism with exponential backoff
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        // Mark as final attempt for proper error logging
        error.context = { ...error.context, isFinalAttempt: true, attempt };
        throw error;
      }
      
      // Check if this is a connection error that should be retried
      const isRetriableError = error.message.includes('socket hang up') || 
                              error.message.includes('Connection error') ||
                              error.message.includes('FetchError') ||
                              error.code === 'ECONNRESET' ||
                              error.code === 'ENOTFOUND' ||
                              error.status === 429;
      
      if (!isRetriableError) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.info(`Connection retry ${attempt}/${maxRetries} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Network status monitoring
export function createNetworkMonitor(onStatusChange) {
  const updateStatus = () => {
    onStatusChange(navigator.onLine);
  };

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);

  return () => {
    window.removeEventListener('online', updateStatus);
    window.removeEventListener('offline', updateStatus);
  };
}