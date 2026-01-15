import React, { useState, useEffect } from 'react';
import { useToastContext } from '../context/ToastContext';
import { vehiclesAPI } from '../utils/api';
import SecureFileUpload from './SecureFileUpload';
import { getUserData } from '../utils/api';

function VehicleDocuments() {
  const toast = useToastContext();
  const [vehicles, setVehicles] = useState([]);
  const [vehicleDocuments, setVehicleDocuments] = useState({}); // vehicleId -> documents array
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState({}); // vehicleId -> boolean
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('license');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const userData = getUserData();
      if (!userData) {
        toast.error('User information not found');
        return;
      }
      
      const userId = userData.id || userData.user_id || userData.userId;
      if (!userId) {
        toast.error('User ID not found');
        return;
      }
      
      const vehiclesData = await vehiclesAPI.getByOwner(userId);
      const vehiclesList = Array.isArray(vehiclesData) 
        ? vehiclesData 
        : (vehiclesData?.vehicles || vehiclesData?.data || []);
      
      // Filter to only show inactive cars (cars that need documents)
      const inactiveVehicles = vehiclesList.filter(vehicle => !vehicle.is_active);
      setVehicles(inactiveVehicles);
      
      // Fetch documents for each inactive vehicle
      const documentsMap = {};
      for (const vehicle of inactiveVehicles) {
        try {
          const docs = await vehiclesAPI.getDocuments(vehicle.id);
          documentsMap[vehicle.id] = Array.isArray(docs) ? docs : (docs?.documents || []);
        } catch (error) {
          console.error(`Error fetching documents for vehicle ${vehicle.id}:`, error);
          documentsMap[vehicle.id] = [];
        }
      }
      setVehicleDocuments(documentsMap);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file, vehicleId, docType) => {
    try {
      setUploading(prev => ({ ...prev, [vehicleId]: true }));
      await vehiclesAPI.uploadDocument(vehicleId, file, docType);
      toast.success('Document uploaded successfully!');
      // Refresh documents for this vehicle
      const docs = await vehiclesAPI.getDocuments(vehicleId);
      setVehicleDocuments(prev => ({
        ...prev,
        [vehicleId]: Array.isArray(docs) ? docs : (docs?.documents || [])
      }));
    } catch (error) {
      console.error('Document upload error:', error);
      toast.error(error.message || 'Failed to upload document');
      throw error;
    } finally {
      setUploading(prev => ({ ...prev, [vehicleId]: false }));
      setSelectedVehicle(null);
    }
  };

  const handleDelete = async (docId, vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      await vehiclesAPI.deleteDocument(docId);
      toast.success('Document deleted successfully');
      // Refresh documents
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

  const handleDownload = async (doc) => {
    try {
      // Documents should have doc_url field directly
      if (doc.doc_url) {
        window.open(doc.doc_url, '_blank');
      } else {
        toast.error('Document URL not available');
      }
    } catch (error) {
      console.error('Document download error:', error);
      toast.error(error.message || 'Failed to download document');
    }
  };

  const getDocTypeLabel = (type) => {
    const labels = {
      'license': 'Vehicle License',
      'insurance': 'Insurance',
    };
    return labels[type] || type;
  };

  const getVehicleName = (vehicle) => {
    return vehicle.name || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || `Vehicle #${vehicle.id}`;
  };

  const hasDocument = (vehicleId, docType) => {
    const docs = vehicleDocuments[vehicleId] || [];
    return docs.some(doc => doc.doc_type === docType);
  };

  const getDocument = (vehicleId, docType) => {
    const docs = vehicleDocuments[vehicleId] || [];
    return docs.find(doc => doc.doc_type === docType);
  };

  if (isLoading) {
    return (
      <div className="vehicle-documents">
        <h2>Car Documents</h2>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="vehicle-documents">
        <h2>Car Documents</h2>
        <p className="section-description">
          Upload vehicle license and insurance documents to activate your cars for rental.
          <br />
          <strong>Accepted file types:</strong> PDF, JPEG (Maximum size: 10MB)
        </p>
        <div className="empty-state">
          <i className="fas fa-car"></i>
          <h3>No vehicles registered</h3>
          <p>Register a vehicle first to upload documents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-documents">
      <h2>Car Documents</h2>
      <p className="section-description">
        Upload vehicle license and insurance documents for each car. Documents must be verified by admin before your car can be activated.
        <br />
        <strong>Accepted file types:</strong> PDF, JPEG, PNG (Maximum size: 10MB)
      </p>

      <div className="vehicles-documents-list">
        {vehicles.map(vehicle => {
          const docs = vehicleDocuments[vehicle.id] || [];
          const licenseDoc = getDocument(vehicle.id, 'license');
          const insuranceDoc = getDocument(vehicle.id, 'insurance');
          const isUploading = uploading[vehicle.id];

          return (
            <div key={vehicle.id} className="vehicle-document-section">
              <div className="vehicle-header">
                <h3>{getVehicleName(vehicle)}</h3>
                <span className={`vehicle-status ${vehicle.is_active ? 'active' : 'inactive'}`}>
                  {vehicle.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="documents-grid">
                {/* License Document */}
                <div className="document-card">
                  <div className="document-header">
                    <h4>
                      <i className="fas fa-id-card"></i> Vehicle License
                      {hasDocument(vehicle.id, 'license') && licenseDoc?.is_verified && (
                        <span className="verified-badge">
                          <i className="fas fa-check-circle"></i> Verified
                        </span>
                      )}
                      {hasDocument(vehicle.id, 'license') && !licenseDoc?.is_verified && (
                        <span className="pending-badge">
                          <i className="fas fa-clock"></i> Pending
                        </span>
                      )}
                    </h4>
                  </div>
                  
                  {hasDocument(vehicle.id, 'license') ? (
                    <div className="document-info">
                      <p>{licenseDoc.file_name}</p>
                      {licenseDoc.uploaded_at && (
                        <p className="document-meta">
                          Uploaded {new Date(licenseDoc.uploaded_at).toLocaleDateString()}
                        </p>
                      )}
                      <div className="document-actions">
                        <button 
                          className="action-btn view"
                          onClick={() => handleDownload(licenseDoc)}
                        >
                          <i className="fas fa-download"></i> View
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDelete(licenseDoc.id, vehicle.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="document-upload">
                      {selectedVehicle === vehicle.id && selectedDocType === 'license' ? (
                        <div>
                          <SecureFileUpload
                            onFileSelect={(file) => handleUpload(file, vehicle.id, 'license')}
                            acceptedTypes={['application/pdf', 'image/jpeg']}
                            maxSize={10 * 1024 * 1024}
                          />
                          <button
                            className="cancel-upload-btn"
                            onClick={() => setSelectedVehicle(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="upload-doc-btn"
                          onClick={() => {
                            setSelectedVehicle(vehicle.id);
                            setSelectedDocType('license');
                          }}
                          disabled={isUploading}
                        >
                          <i className="fas fa-upload"></i> Upload License
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Insurance Document */}
                <div className="document-card">
                  <div className="document-header">
                    <h4>
                      <i className="fas fa-shield-alt"></i> Insurance
                      {hasDocument(vehicle.id, 'insurance') && insuranceDoc?.is_verified && (
                        <span className="verified-badge">
                          <i className="fas fa-check-circle"></i> Verified
                        </span>
                      )}
                      {hasDocument(vehicle.id, 'insurance') && !insuranceDoc?.is_verified && (
                        <span className="pending-badge">
                          <i className="fas fa-clock"></i> Pending
                        </span>
                      )}
                    </h4>
                  </div>
                  
                  {hasDocument(vehicle.id, 'insurance') ? (
                    <div className="document-info">
                      <p>{insuranceDoc.file_name}</p>
                      {insuranceDoc.uploaded_at && (
                        <p className="document-meta">
                          Uploaded {new Date(insuranceDoc.uploaded_at).toLocaleDateString()}
                        </p>
                      )}
                      <div className="document-actions">
                        <button 
                          className="action-btn view"
                          onClick={() => handleDownload(insuranceDoc)}
                        >
                          <i className="fas fa-download"></i> View
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDelete(insuranceDoc.id, vehicle.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="document-upload">
                      {selectedVehicle === vehicle.id && selectedDocType === 'insurance' ? (
                        <div>
                          <SecureFileUpload
                            onFileSelect={(file) => handleUpload(file, vehicle.id, 'insurance')}
                            acceptedTypes={['application/pdf', 'image/jpeg']}
                            maxSize={10 * 1024 * 1024}
                          />
                          <button
                            className="cancel-upload-btn"
                            onClick={() => setSelectedVehicle(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="upload-doc-btn"
                          onClick={() => {
                            setSelectedVehicle(vehicle.id);
                            setSelectedDocType('insurance');
                          }}
                          disabled={isUploading}
                        >
                          <i className="fas fa-upload"></i> Upload Insurance
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="vehicle-requirements">
                <p className="requirements-note">
                  <i className="fas fa-info-circle"></i>
                  Both license and insurance must be verified by admin for this vehicle to be activated.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VehicleDocuments;

