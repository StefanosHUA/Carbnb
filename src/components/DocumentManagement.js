import React, { useState, useEffect } from 'react';
import { useToastContext } from '../context/ToastContext';
import { documentsAPI } from '../utils/api';
import SecureFileUpload from './SecureFileUpload';

function DocumentManagement() {
  const toast = useToastContext();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('id');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await documentsAPI.getMyDocuments();
      setDocuments(docs || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      await documentsAPI.upload(file, selectedDocType);
      toast.success('Document uploaded successfully!');
      fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Document upload error:', error);
      const errorMessage = error.message || 'Failed to upload document. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      await documentsAPI.delete(documentId);
      toast.success('Document deleted successfully!');
      fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Document delete error:', error);
      const errorMessage = error.message || 'Failed to delete document. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await documentsAPI.getDownloadUrl(documentId);
      if (response.download_url) {
        window.open(response.download_url, '_blank');
      } else {
        toast.error('Failed to get download URL');
      }
    } catch (error) {
      console.error('Document download error:', error);
      const errorMessage = error.message || 'Failed to download document. Please try again.';
      toast.error(errorMessage);
    }
  };

  const getDocTypeLabel = (type) => {
    const labels = {
      'id': 'ID Card',
      'driver_license': 'Driver License',
      'passport': 'Passport',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="document-management">
        <h2>Documents</h2>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="document-management">
      <h2>Documents</h2>
      <p className="section-description">Upload verification documents for account verification</p>

      <div className="document-upload-section">
        <h3>Upload New Document</h3>
        <div className="form-group">
          <label htmlFor="doc_type">Document Type</label>
          <select
            id="doc_type"
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="document-type-select"
          >
            <option value="id">ID Card</option>
            <option value="driver_license">Driver License</option>
          </select>
        </div>

        <SecureFileUpload
          onFileSelect={handleUpload}
          acceptedTypes={['application/pdf', 'image/jpeg', 'image/png']}
          maxSize={10 * 1024 * 1024} // 10MB
        />
      </div>

      <div className="documents-list">
        <h3>Your Documents</h3>
        {documents.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-file-alt"></i>
            <p>No documents uploaded yet</p>
            <p className="empty-state-hint">Upload a document to get started</p>
          </div>
        ) : (
          <div className="documents-grid">
            {documents.map((doc) => (
              <div key={doc.id} className="document-card">
                <div className="document-header">
                  <div className="document-icon">
                    <i className="fas fa-file-pdf"></i>
                  </div>
                  <div className="document-info">
                    <h4>{getDocTypeLabel(doc.doc_type)}</h4>
                    <p className="document-meta">
                      {doc.file_name || 'Document'}
                      {doc.uploaded_at && (
                        <span> • {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="document-status">
                  {doc.is_verified ? (
                    <span className="status-badge verified">
                      <i className="fas fa-check-circle"></i> Verified
                    </span>
                  ) : (
                    <span className="status-badge pending">
                      <i className="fas fa-clock"></i> Pending Review
                    </span>
                  )}
                </div>
                <div className="document-actions">
                  <button
                    className="action-btn view"
                    onClick={() => handleDownload(doc.id)}
                    title="Download document"
                  >
                    <i className="fas fa-download"></i> Download
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(doc.id)}
                    title="Delete document"
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentManagement;

