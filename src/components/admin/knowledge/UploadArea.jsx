import React, { useState } from 'react';
import { uploadDocument } from '../../../services/knowledgeApi';

export default function UploadArea({ onSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setProgress(25);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('type', file.name.split('.').pop().toUpperCase());

      setProgress(60);
      await uploadDocument(formData);
      setProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        onSuccess();
      }, 500);
    } catch (err) {
      console.error(err);
      setUploading(false);
      setProgress(0);
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div 
      className={`upload-area ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('upload-input').click()}
    >
      <input type="file" id="upload-input" style={{ display: 'none' }} onChange={handleChange} />
      
      {!uploading ? (
        <div className="upload-content">
          <div className="upload-icon-circle">
            <i className="fas fa-upload"></i>
          </div>
          <h3>Drag & drop enterprise documents here</h3>
          <p>The pipeline will automatically Extract, Clean, Chunk, Embed, and Index into MongoDB. (PDF, DOCX, TXT, CSV, MD up to 50MB)</p>
        </div>
      ) : (
        <div className="upload-progress">
          <h3>Uploading document...</h3>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p>{progress}% complete</p>
        </div>
      )}
    </div>
  );
}
