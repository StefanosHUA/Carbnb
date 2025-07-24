// Security utilities for input sanitization and file validation

// List of dangerous file extensions that could contain executable code
const DANGEROUS_EXTENSIONS = [
  '.py', '.js', '.php', '.asp', '.aspx', '.jsp', '.jspx', '.pl', '.cgi',
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.jar', '.war',
  '.ear', '.class', '.swf', '.fla', '.sh', '.bash', '.ps1', '.psm1',
  '.psd1', '.psc1', '.psc2', '.rb', '.rbs', '.pyc', '.pyo', '.pyd',
  '.dll', '.so', '.dylib', '.sys', '.drv', '.ocx', '.cpl', '.msi',
  '.msp', '.mst', '.app', '.deb', '.rpm', '.pkg', '.dmg', '.iso'
];

// List of dangerous MIME types
const DANGEROUS_MIME_TYPES = [
  'application/x-executable',
  'application/x-msdownload',
  'application/x-msi',
  'application/x-python-code',
  'text/x-python',
  'application/x-javascript',
  'text/javascript',
  'application/x-php',
  'text/x-php',
  'application/x-perl',
  'text/x-perl',
  'application/x-ruby',
  'text/x-ruby',
  'application/x-shellscript',
  'text/x-shellscript',
  'application/x-bat',
  'text/x-bat',
  'application/x-msdos-program',
  'application/x-msdos-program'
];

/**
 * Sanitize text input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove potentially dangerous HTML tags and attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/<input\b[^<]*>/gi, '')
    .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '')
    .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '')
    .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .replace(/&#x?[0-9a-f]+/gi, '')
    .replace(/&#[0-9]+/g, '')
    .trim();
};

/**
 * Validate file upload to prevent malicious files
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with isValid boolean and error message
 */
export const validateFileUpload = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 10MB limit' };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
  
  if (DANGEROUS_EXTENSIONS.includes(fileExtension)) {
    return { 
      isValid: false, 
      error: `File type ${fileExtension} is not allowed for security reasons` 
    };
  }

  // Check MIME type
  if (DANGEROUS_MIME_TYPES.includes(file.type.toLowerCase())) {
    return { 
      isValid: false, 
      error: `File type ${file.type} is not allowed for security reasons` 
    };
  }

  // Additional check for executable files by reading first few bytes
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target.result).subarray(0, 4);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      
      // Check for common executable file signatures
      const executableSignatures = [
        '4d5a', // MZ (Windows executable)
        '7f454c46', // ELF (Linux executable)
        'cafebabe', // Java class file
        '504b0304', // ZIP/JAR file
        '504b0506', // ZIP/JAR file
        '504b0708'  // ZIP/JAR file
      ];
      
      if (executableSignatures.some(sig => header.startsWith(sig))) {
        resolve({ 
          isValid: false, 
          error: 'Executable files are not allowed for security reasons' 
        });
      } else {
        resolve({ isValid: true, error: null });
      }
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Sanitize form data object
 * @param {Object} formData - The form data object to sanitize
 * @returns {Object} - Sanitized form data
 */
export const sanitizeFormData = (formData) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeFormData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validate URL to prevent malicious redirects
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is safe
 */
export const validateUrl = (url) => {
  if (!url) return true;
  
  try {
    const urlObj = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false;
    }
    
    // Check for common malicious patterns
    const maliciousPatterns = [
      /javascript:/i,
      /vbscript:/i,
      /data:/i,
      /file:/i
    ];
    
    return !maliciousPatterns.some(pattern => pattern.test(url));
  } catch (error) {
    return false;
  }
};

/**
 * Rate limiting utility
 */
export class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }

  reset(identifier) {
    this.requests.delete(identifier);
  }
} 