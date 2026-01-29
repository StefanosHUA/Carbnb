import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useToastContext } from '../context/ToastContext';
import { vehiclesAPI } from '../utils/api';

function VehiclePhotoUpload({ vehicleId, existingPhotos = [], onPhotosUpdated }) {
  const toast = useToastContext();
  const fileInputRef = useRef(null);
  const errorHandledRef = useRef(new Set());
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState(existingPhotos || []);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const media = await vehiclesAPI.getMedia(vehicleId);
      console.log('Fetched media:', media);
      const photosArray = Array.isArray(media) ? media : [];
      console.log('Photos array:', photosArray);
      photosArray.forEach((photo, idx) => {
        console.log(`Photo ${idx}:`, {
          id: photo.id,
          media_url: photo.media_url,
          url: photo.url,
          is_primary: photo.is_primary,
          media_type: photo.media_type
        });
      });
      setPhotos(photosArray);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);


  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      // Check file type - handle both MIME type and file extension (same logic as SecureFileUpload)
      let isValidType = false;
      const fileName = file.name.toLowerCase();
      let detectedType = file.type;
      
      // First check MIME type
      if (validTypes.includes(file.type)) {
        isValidType = true;
        detectedType = file.type;
      } else if (!file.type || file.type === 'application/octet-stream') {
        // Fallback to extension check if MIME type is missing or generic
        const extensionToMimeType = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
        };
        
        // Find matching extension
        for (const [ext, mimeType] of Object.entries(extensionToMimeType)) {
          if (fileName.endsWith(ext)) {
            detectedType = mimeType;
            if (validTypes.includes(mimeType)) {
              isValidType = true;
            }
            break;
          }
        }
      }

      if (!isValidType) {
        invalidFiles.push(`${file.name}: Invalid file type (only JPEG and PNG allowed)`);
      } else if (file.size > maxSize) {
        invalidFiles.push(`${file.name}: File too large (max 10MB)`);
      } else {
        // Ensure file has correct MIME type before adding (same as uploadDocument)
        let fileToAdd = file;
        if (!file.type || file.type === 'application/octet-stream' || file.type !== detectedType) {
          fileToAdd = new File([file], file.name, { type: detectedType });
        }
        validFiles.push(fileToAdd);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`Some files were rejected: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length === 0) return;

    // Create previews
    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false
    }));

    setPreviews(prev => [...prev, ...newPreviews]);

    // Upload files
    setUploading(true);
    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        const previewIndex = newPreviews.findIndex(p => p.file === file);
        setPreviews(prev => {
          const updated = [...prev];
          if (updated[previewIndex]) {
            updated[previewIndex].uploading = true;
          }
          return updated;
        });

        try {
          const isPrimary = photos.length === 0 && index === 0; // First photo is primary
          const result = await vehiclesAPI.uploadMedia(vehicleId, file, isPrimary);
          
          setPreviews(prev => {
            const updated = prev.filter(p => p.file !== file);
            return updated;
          });

          return result;
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          console.error(`Error details:`, error.data || error.message);
          console.error(`File type:`, file.type);
          console.error(`File name:`, file.name);
          setPreviews(prev => {
            const updated = prev.filter(p => p.file !== file);
            return updated;
          });
          throw error;
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        toast.success(`Successfully uploaded ${successful} photo(s)`);
        // Refresh photos
        await fetchPhotos();
        // Call callback after a small delay to avoid re-render loops
        if (onPhotosUpdated) {
          setTimeout(() => {
            onPhotosUpdated();
          }, 100);
        }
      }

      if (failed > 0) {
        toast.error(`Failed to upload ${failed} photo(s)`);
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await vehiclesAPI.deleteMedia(mediaId);
      toast.success('Photo deleted successfully');
      await fetchPhotos();
      // Call callback after a small delay to avoid re-render loops
      if (onPhotosUpdated) {
        setTimeout(() => {
          onPhotosUpdated();
        }, 100);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  const handleSetPrimary = async (mediaId) => {
    try {
      // Use the setPrimary endpoint if available
      await vehiclesAPI.setPrimaryMedia(mediaId);
      toast.success('Primary photo updated successfully');
      await fetchPhotos();
      // Call callback after a small delay to avoid re-render loops
      if (onPhotosUpdated) {
        setTimeout(() => {
          onPhotosUpdated();
        }, 100);
      }
    } catch (error) {
      console.error('Error setting primary photo:', error);
      // If setPrimary endpoint doesn't exist, just refresh
      await fetchPhotos();
      toast.error('Failed to set primary photo');
    }
  };

  return (
    <div className="vehicle-photo-upload">
      <div className="photo-upload-header">
        <h3>Car Photos</h3>
        <p>Upload photos of your car to attract more renters</p>
      </div>

      {/* Upload Button */}
      <div className="photo-upload-area">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,.jpeg,.jpg,.png"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
          id={`photo-upload-${vehicleId}`}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Photo upload button clicked', { uploading, vehicleId });
            if (!uploading && fileInputRef.current) {
              console.log('Triggering file input click');
              fileInputRef.current.click();
            } else {
              console.log('Cannot trigger upload:', { uploading, hasRef: !!fileInputRef.current });
            }
          }}
          disabled={uploading}
          className={`photo-upload-button ${uploading ? 'uploading' : ''}`}
          style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
        >
          <i className="fas fa-camera"></i>
          <span>{uploading ? 'Uploading...' : 'Add Photos'}</span>
        </button>
        <p className="photo-upload-hint">You can upload multiple files at once (JPEG, PNG, max 10MB each)</p>
      </div>

      {/* Preview Uploading Photos */}
      {previews.length > 0 && (
        <div className="photo-preview-grid">
          {previews.map((preview, index) => (
            <div key={index} className="photo-preview-item">
              <img src={preview.preview} alt="Preview" />
              {preview.uploading && (
                <div className="photo-upload-overlay">
                  <div className="loading-spinner"></div>
                  <p>Uploading...</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Existing Photos */}
      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map((photo, index) => {
            const imageUrl = photo.media_url || photo.url || photo.image;
            const isPdf = photo.mime_type === 'application/pdf' || 
                        (imageUrl && imageUrl.toLowerCase().endsWith('.pdf'));
            
            return (
              <div key={photo.id || `photo-${index}`} className="photo-item">
                {isPdf ? (
                  <div className="pdf-preview">
                    <i className="fas fa-file-pdf" style={{ fontSize: '48px', color: '#dc2626' }}></i>
                    <p style={{ marginTop: '10px', fontSize: '12px' }}>{photo.file_name || 'PDF Document'}</p>
                    <a 
                      href={imageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="view-pdf-btn"
                      style={{ 
                        marginTop: '10px', 
                        padding: '8px 16px', 
                        background: '#2563eb', 
                        color: 'white', 
                        borderRadius: '4px',
                        textDecoration: 'none',
                        display: 'inline-block'
                      }}
                    >
                      View PDF
                    </a>
                  </div>
                ) : (
                  <img 
                    key={`img-${photo.id || index}`}
                    src={imageUrl} 
                    alt={photo.alt_text || `Car photo ${index + 1}`}
                    onError={(e) => {
                      const imageKey = `error-${photo.id || imageUrl || index}`;
                      // Only handle error once per image to prevent infinite loops
                      if (!errorHandledRef.current.has(imageKey)) {
                        errorHandledRef.current.add(imageKey);
                        const fallbackUrl = 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80';
                        // Only set fallback if current src is not already the fallback
                        if (e.target.src !== fallbackUrl && e.target.src !== window.location.origin + fallbackUrl) {
                          e.target.src = fallbackUrl;
                          e.target.onerror = null; // Prevent infinite error loop
                        }
                      }
                    }}
                    onLoad={() => {
                      // Clear error tracking on successful load
                      const imageKey = `error-${photo.id || imageUrl || index}`;
                      errorHandledRef.current.delete(imageKey);
                    }}
                    loading="lazy"
                  />
                )}
                <div className="photo-overlay">
                  {photo.is_primary && (
                    <span className="primary-badge">
                      <i className="fas fa-star"></i> Primary
                    </span>
                  )}
                  <div className="photo-actions">
                    {!photo.is_primary && (
                      <button
                        className="photo-action-btn primary-btn"
                        onClick={() => handleSetPrimary(photo.id)}
                        title="Set as primary"
                      >
                        <i className="fas fa-star"></i>
                      </button>
                    )}
                    <button
                      className="photo-action-btn delete-btn"
                      onClick={() => handleDeletePhoto(photo.id)}
                      title="Delete photo"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="photo-empty-state">
          <div className="loading-spinner"></div>
          <p>Loading photos...</p>
        </div>
      )}

      {!loading && photos.length === 0 && previews.length === 0 && (
        <div className="photo-empty-state">
          <i className="fas fa-images"></i>
          <p>No photos uploaded yet</p>
        </div>
      )}
    </div>
  );
}

export default VehiclePhotoUpload;

