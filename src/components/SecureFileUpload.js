import React, { useState } from 'react';
import { validateFileUpload } from '../utils/security';

const SecureFileUpload = ({ 
  onFileSelect, 
  acceptedTypes = ['image/*'], 
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  className = '',
  children 
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileValidation = async (files) => {
    setIsValidating(true);
    setError('');

    try {
      const fileArray = Array.from(files);
      const validFiles = [];

      for (const file of fileArray) {
        // Check file size
        if (file.size > maxSize) {
          setError(`File ${file.name} is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
          return;
        }

        // Validate file type
        const validation = await validateFileUpload(file);
        if (!validation.isValid) {
          setError(validation.error);
          return;
        }

        // Check if file type is accepted
        if (acceptedTypes.length > 0) {
          const isAccepted = acceptedTypes.some(type => {
            if (type.endsWith('/*')) {
              const baseType = type.replace('/*', '');
              return file.type.startsWith(baseType);
            }
            return file.type === type;
          });

          if (!isAccepted) {
            setError(`File type ${file.type} is not accepted.`);
            return;
          }
        }

        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        onFileSelect(multiple ? validFiles : validFiles[0]);
      }
    } catch (error) {
      setError('Error validating file. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileValidation(files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileValidation(files);
    }
  };

  const handleClick = () => {
    document.getElementById('secure-file-input').click();
  };

  return (
    <div className={`secure-file-upload ${className}`}>
      <input
        id="secure-file-input"
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
      
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${isValidating ? 'validating' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {isValidating ? (
          <div className="upload-status">
            <div className="spinner"></div>
            <p>Validating file...</p>
          </div>
        ) : (
          children || (
            <div className="upload-content">
              <i className="fas fa-cloud-upload-alt"></i>
              <p>Click to upload or drag and drop</p>
              <p className="upload-hint">
                Accepted types: {acceptedTypes.join(', ')}
                <br />
                Max size: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          )
        )}
      </div>

      {error && (
        <div className="upload-error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default SecureFileUpload; 