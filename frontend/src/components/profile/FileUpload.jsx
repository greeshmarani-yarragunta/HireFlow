import React, { useRef, useState } from 'react';
import { FiUploadCloud, FiFile, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const FileUpload = ({
  onFileSelect,
  currentFileName,
  accept = '.pdf,.docx',
  maxSizeMB = 5,
  label = 'Upload Resume',
}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const validateAndHandleFile = (file) => {
    if (!file) return;

    // Check extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const validExtensions = accept.split(',').map((e) => e.trim().toLowerCase());
    if (!validExtensions.includes(ext)) {
      setError(`Invalid file format. Allowed: ${accept}`);
      return;
    }

    // Check size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds maximum limit of ${maxSizeMB}MB.`);
      return;
    }

    setError('');
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndHandleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <label className="form-label">{label}</label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--primary)' : 'var(--border)'}`,
          backgroundColor: isDragOver ? 'var(--primary-light)' : 'var(--bg-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              validateAndHandleFile(e.target.files[0]);
            }
          }}
        />

        <div style={{ color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
          <FiUploadCloud size={36} />
        </div>

        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          {selectedFile
            ? selectedFile.name
            : currentFileName
            ? `Current: ${currentFileName}`
            : 'Click or drag & drop to upload'}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Supports PDF and DOCX (Max {maxSizeMB}MB)
        </div>
      </div>

      {selectedFile && (
        <div
          style={{
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--success-text)',
          }}
        >
          <FiCheckCircle size={15} />
          <span>Ready to upload: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--danger)',
          }}
        >
          <FiAlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
