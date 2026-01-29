import React, { useState, useEffect } from 'react';
import { useToastContext } from '../context/ToastContext';
import { vehiclesAPI } from '../utils/api';
import { getUserData } from '../utils/api';
import './VehicleDocuments.css';

function VehicleDocuments() {
  const toast = useToastContext();
  const [vehicles, setVehicles] = useState([]);
  const [vehicleDocuments, setVehicleDocuments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const userData = getUserData();
      if (!userData) {
        setIsLoading(false);
        return;
      }
      
      const userId = userData.id || userData.user_id || userData.userId;
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      const vehiclesData = await vehiclesAPI.getByOwner(userId);
      const vehiclesList = Array.isArray(vehiclesData) 
        ? vehiclesData 
        : (vehiclesData?.vehicles || vehiclesData?.data || []);
      
      setVehicles(vehiclesList);
      
      if (vehiclesList.length > 0) {
        const documentsMap = {};
        for (const vehicle of vehiclesList) {
          try {
            const docs = await vehiclesAPI.getDocuments(vehicle.id);
            documentsMap[vehicle.id] = Array.isArray(docs) ? docs : (docs?.documents || []);
          } catch (error) {
            console.error(`Error fetching documents for vehicle ${vehicle.id}:`, error);
            documentsMap[vehicle.id] = [];
          }
        }
        setVehicleDocuments(documentsMap);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e, vehicleId, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload PDF, JPEG, or PNG files only');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(prev => ({ ...prev, [`${vehicleId}-${docType}`]: true }));
      await vehiclesAPI.uploadDocument(vehicleId, file, docType);
      toast.success(`${docType === 'license' ? 'License' : 'Insurance'} uploaded successfully!`);
      
      // Refresh documents
      const docs = await vehiclesAPI.getDocuments(vehicleId);
      setVehicleDocuments(prev => ({
        ...prev,
        [vehicleId]: Array.isArray(docs) ? docs : (docs?.documents || [])
      }));
    } catch (error) {
      console.error('Document upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(prev => ({ ...prev, [`${vehicleId}-${docType}`]: false }));
      e.target.value = '';
    }
  };

  const handleDelete = async (docId, vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await vehiclesAPI.deleteDocument(docId);
      toast.success('Document deleted successfully');
      
      const docs = await vehiclesAPI.getDocuments(vehicleId);
      setVehicleDocuments(prev => ({
        ...prev,
        [vehicleId]: Array.isArray(docs) ? docs : (docs?.documents || [])
      }));
    } catch (error) {
      console.error('Document delete error:', error);
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const handleView = (doc) => {
    if (doc.doc_url) {
      window.open(doc.doc_url, '_blank');
    } else {
      toast.error('Document URL not available');
    }
  };

  const getVehicleName = (vehicle) => {
    return vehicle.name || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || `Vehicle #${vehicle.id}`;
  };

  const getDocument = (vehicleId, docType) => {
    const docs = vehicleDocuments[vehicleId] || [];
    return docs.find(doc => doc.doc_type === docType);
  };

  if (isLoading) {
    return (
      <div className="vehicle-documents-modern">
        <div className="documents-header">
          <h2><i className="fas fa-file-alt"></i> Vehicle Documents</h2>
          <p className="header-subtitle">Manage your vehicle documentation</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="vehicle-documents-modern">
        <div className="documents-header">
          <h2><i className="fas fa-file-alt"></i> Vehicle Documents</h2>
          <p className="header-subtitle">Upload vehicle license and insurance documents to activate your cars</p>
        </div>
        <div className="empty-state-modern">
          <div className="empty-icon">
            <i className="fas fa-car"></i>
          </div>
          <h3>No vehicles registered</h3>
          <p>Register a vehicle first to upload documents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-documents-modern">
      <div className="documents-header">
        <h2><i className="fas fa-file-alt"></i> Vehicle Documents</h2>
        <p className="header-subtitle">
          Upload vehicle license and insurance documents. Both must be verified by admin for activation.
        </p>
        <div className="file-requirements">
          <i className="fas fa-check-circle"></i>
          <span>PDF, JPEG, PNG</span>
          <span className="divider">•</span>
          <span>Max 10MB</span>
        </div>
      </div>

      <div className="vehicles-grid-modern">
        {vehicles.map(vehicle => {
          const licenseDoc = getDocument(vehicle.id, 'license');
          const insuranceDoc = getDocument(vehicle.id, 'insurance');
          const licenseUploading = uploading[`${vehicle.id}-license`];
          const insuranceUploading = uploading[`${vehicle.id}-insurance`];

          return (
            <div key={vehicle.id} className="vehicle-card-modern">
              <div className="vehicle-card-header">
                <div className="vehicle-info">
                  <h3>{getVehicleName(vehicle)}</h3>
                  <div className="vehicle-meta">
                    <span className={`status-badge ${vehicle.is_active ? 'status-active' : 'status-inactive'}`}>
                      <i className={`fas fa-${vehicle.is_active ? 'check-circle' : 'clock'}`}></i>
                      {vehicle.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="documents-row">
                {/* License Document */}
                <div className="doc-card">
                  <div className="doc-card-header">
                    <div className="doc-icon license-icon">
                      <i className="fas fa-id-card"></i>
                    </div>
                    <div className="doc-title">
                      <h4>Vehicle License</h4>
                      {licenseDoc?.is_verified && (
                        <span className="badge-verified">
                          <i className="fas fa-check-circle"></i> Verified
                        </span>
                      )}
                      {licenseDoc && !licenseDoc.is_verified && (
                        <span className="badge-pending">
                          <i className="fas fa-clock"></i> Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {licenseDoc ? (
                    <div className="doc-uploaded">
                      <div className="file-info-box">
                        <i className="fas fa-file-pdf"></i>
                        <div className="file-details">
                          <p className="file-name">{licenseDoc.file_name}</p>
                          <p className="file-date">
                            {new Date(licenseDoc.uploaded_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="doc-actions">
                        <button 
                          type="button"
                          className="btn-action btn-view"
                          onClick={() => handleView(licenseDoc)}
                        >
                          <i className="fas fa-eye"></i> View
                        </button>
                        <button 
                          type="button"
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(licenseDoc.id, vehicle.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="doc-upload-zone">
                      <input
                        type="file"
                        id={`license-${vehicle.id}`}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, vehicle.id, 'license')}
                        disabled={licenseUploading}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor={`license-${vehicle.id}`} className="upload-label">
                        {licenseUploading ? (
                          <div className="upload-progress">
                            <div className="spinner-upload"></div>
                            <p>Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <i className="fas fa-cloud-upload-alt upload-icon"></i>
                            <p className="upload-text">Click to upload</p>
                            <p className="upload-hint">PDF, JPEG, PNG (Max 10MB)</p>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                {/* Insurance Document */}
                <div className="doc-card">
                  <div className="doc-card-header">
                    <div className="doc-icon insurance-icon">
                      <i className="fas fa-shield-alt"></i>
                    </div>
                    <div className="doc-title">
                      <h4>Insurance</h4>
                      {insuranceDoc?.is_verified && (
                        <span className="badge-verified">
                          <i className="fas fa-check-circle"></i> Verified
                        </span>
                      )}
                      {insuranceDoc && !insuranceDoc.is_verified && (
                        <span className="badge-pending">
                          <i className="fas fa-clock"></i> Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {insuranceDoc ? (
                    <div className="doc-uploaded">
                      <div className="file-info-box">
                        <i className="fas fa-file-pdf"></i>
                        <div className="file-details">
                          <p className="file-name">{insuranceDoc.file_name}</p>
                          <p className="file-date">
                            {new Date(insuranceDoc.uploaded_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="doc-actions">
                        <button 
                          type="button"
                          className="btn-action btn-view"
                          onClick={() => handleView(insuranceDoc)}
                        >
                          <i className="fas fa-eye"></i> View
                        </button>
                        <button 
                          type="button"
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(insuranceDoc.id, vehicle.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="doc-upload-zone">
                      <input
                        type="file"
                        id={`insurance-${vehicle.id}`}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, vehicle.id, 'insurance')}
                        disabled={insuranceUploading}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor={`insurance-${vehicle.id}`} className="upload-label">
                        {insuranceUploading ? (
                          <div className="upload-progress">
                            <div className="spinner-upload"></div>
                            <p>Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <i className="fas fa-cloud-upload-alt upload-icon"></i>
                            <p className="upload-text">Click to upload</p>
                            <p className="upload-hint">PDF, JPEG, PNG (Max 10MB)</p>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {!vehicle.is_active && (
                <div className="requirements-notice">
                  <i className="fas fa-info-circle"></i>
                  <span>Both license and insurance must be uploaded and verified by admin for activation</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VehicleDocuments;
