import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { parseCSV, downloadSampleCSV } from '../services/csvParser';

/**
 * CSV Uploader Component
 * Allows users to upload CSV files containing bug data
 */
const CSVUploader = ({ onDataLoaded, onError }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error' | null
    const [statusMessage, setStatusMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = async (file) => {
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.csv')) {
            setUploadStatus('error');
            setStatusMessage('Please upload a CSV file');
            onError?.('Invalid file type. Please upload a CSV file.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 20 * 1024 * 1024) {
            setUploadStatus('error');
            setStatusMessage('File too large (max 10MB)');
            onError?.('File size exceeds 10MB limit');
            return;
        }

        setIsProcessing(true);
        setUploadStatus(null);
        setStatusMessage('');

        try {
            const result = await parseCSV(file);

            setUploadStatus('success');
            setStatusMessage(`Successfully loaded ${result.count} issues from CSV`);

            // Pass the parsed issues to parent component
            onDataLoaded?.(result.issues);

            // Clear status after 3 seconds
            setTimeout(() => {
                setUploadStatus(null);
                setStatusMessage('');
            }, 3000);
        } catch (error) {
            console.error('CSV upload error:', error);
            setUploadStatus('error');
            setStatusMessage(error.message || 'Failed to parse CSV file');
            onError?.(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleDownloadTemplate = () => {
        downloadSampleCSV();
    };

    return (
        <div className="csv-uploader">
            {/* Upload Area */}
            <div
                className={`upload-zone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                />

                <div className="upload-content">
                    {isProcessing ? (
                        <>
                            <div className="spinner"></div>
                            <p>Processing CSV file...</p>
                        </>
                    ) : (
                        <>
                            <Upload size={48} />
                            <h3>Upload CSV File</h3>
                            <p>Drag and drop or click to browse</p>
                            <span className="file-info">Supported: .csv (max 10MB)</span>
                        </>
                    )}
                </div>
            </div>

            {/* Status Message */}
            {uploadStatus && (
                <div className={`status-message ${uploadStatus}`}>
                    {uploadStatus === 'success' ? (
                        <CheckCircle size={20} />
                    ) : (
                        <AlertCircle size={20} />
                    )}
                    <span>{statusMessage}</span>
                </div>
            )}

            {/* Download Template Button */}
            <button
                className="download-template-btn"
                onClick={handleDownloadTemplate}
                title="Download CSV template"
            >
                <Download size={16} />
                <span>Download Template</span>
            </button>

            <style jsx>{`
        .csv-uploader {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .upload-zone {
          border: 2px dashed rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(139, 92, 246, 0.05);
        }

        .upload-zone:hover {
          border-color: rgba(139, 92, 246, 0.6);
          background: rgba(139, 92, 246, 0.1);
        }

        .upload-zone.dragging {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.15);
          transform: scale(1.02);
        }

        .upload-zone.processing {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #e2e8f0;
        }

        .upload-content svg {
          color: #8b5cf6;
          margin-bottom: 0.5rem;
        }

        .upload-content h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .upload-content p {
          margin: 0;
          color: #94a3b8;
        }

        .file-info {
          font-size: 0.875rem;
          color: #64748b;
          margin-top: 0.5rem;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(139, 92, 246, 0.2);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .status-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          animation: slideIn 0.3s ease;
        }

        .status-message.success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }

        .status-message.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .download-template-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          color: #8b5cf6;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          align-self: flex-start;
        }

        .download-template-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
        }

        .download-template-btn:active {
          transform: scale(0.98);
        }
      `}</style>
        </div>
    );
};

export default CSVUploader;
