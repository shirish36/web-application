import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './CsvUpload.css';

const CsvUpload: React.FC = () => {
  const { user } = useAuth0();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadResponse(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadResponse('Uploading file to Google Cloud Storage...');

    try {
      // Simulate file upload process
      // In a real implementation, you would upload to Google Cloud Storage
      // and then trigger the batch processing job
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload time
      
      setUploadResponse('File uploaded successfully! Processing will begin shortly.');
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResponse('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="csv-upload">
      <div className="upload-header">
        <h1>CSV File Upload</h1>
        <p>Upload your CSV files for processing</p>
      </div>

      <div className="upload-container">
        <div 
          className={'drop-zone' + (dragOver ? ' drag-over' : '')}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="drop-zone-content">
            <div className="upload-icon"></div>
            <h3>Drop your CSV file here</h3>
            <p>or</p>
            <label htmlFor="csv-file" className="file-select-btn">
              Choose File
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {file && (
          <div className="file-info">
            <h3>Selected File:</h3>
            <div className="file-details">
              <p><strong>Name:</strong> {file.name}</p>
              <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
              <p><strong>Type:</strong> {file.type}</p>
            </div>
            
            <button 
              onClick={handleUpload}
              disabled={uploading}
              className="upload-btn"
            >
              {uploading ? 'Uploading...' : 'Upload & Process'}
            </button>
          </div>
        )}

        {uploadResponse && (
          <div className={'upload-status' + (uploadResponse.includes('failed') ? ' error' : ' success')}>
            <p>{uploadResponse}</p>
          </div>
        )}

        <div className="upload-info">
          <h3>Upload Instructions:</h3>
          <ul>
            <li>Only CSV files are accepted</li>
            <li>Maximum file size: 10 MB</li>
            <li>Files will be processed automatically after upload</li>
            <li>You can track processing result in the Dashboard</li>
          </ul>
        </div>

        <div className="user-info-section">
          <p><strong>Uploading as:</strong> {user?.name || user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default CsvUpload;
