import React, { useState, useRef } from 'react';
import { processReceipt, validateExtractedData } from '../../services/ocrService';
import { uploadReceipt } from '../../services/expenseService';

/**
 * ReceiptUpload Component
 * Handles receipt image upload with drag-and-drop, OCR processing, and data extraction
 */
const ReceiptUpload = ({ onDataExtracted, onImageSelected, onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Process the selected file
  const handleFile = async (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    // Validate file size (max 5MB to match backend)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Notify parent component
    if (onImageSelected) {
      onImageSelected(file);
    }

    // Automatically upload the file to backend
    await handleUploadFile(file);
  };

  // Upload file to backend
  const handleUploadFile = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const result = await uploadReceipt(file, (progress) => {
        setUploadProgress(progress);
      });

      setUploadedFileUrl(result.url);
      
      // Notify parent component with uploaded file URL
      if (onUploadComplete) {
        onUploadComplete(result.url);
      }
    } catch (err) {
      console.error('Upload error:', err);
      
      // Provide detailed error messages
      let errorMessage = 'Failed to upload receipt. Please try again.';
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check if the backend server is running on port 5000.';
      } else if (err.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.status === 413) {
        errorMessage = 'File is too large. Maximum size is 5MB.';
      } else if (err.status === 400) {
        errorMessage = err.message || 'Invalid file. Please upload a valid image (JPG, PNG, GIF, or WEBP).';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Process receipt with OCR
  const handleProcessReceipt = async () => {
    if (!imageFile) return;

    setProcessing(true);
    setProgress(0);
    setError(null);
    setExtractedData(null);

    try {
      const result = await processReceipt(imageFile, (progressValue) => {
        setProgress(progressValue);
      });

      if (result.success) {
        setExtractedData(result.data);
        
        // Notify parent component with extracted data
        if (onDataExtracted) {
          onDataExtracted(result.data);
        }
      } else {
        setError(result.error || 'Failed to process receipt');
      }
    } catch (err) {
      setError('An error occurred during OCR processing');
      console.error('OCR error:', err);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  // Clear uploaded image and data
  const handleClear = () => {
    setImagePreview(null);
    setImageFile(null);
    setExtractedData(null);
    setUploadedFileUrl(null);
    setError(null);
    setProgress(0);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get confidence color based on score
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-error';
  };

  // Get confidence label
  const getConfidenceLabel = (confidence) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  return (
    <div className="mb-6">
      <label className="block text-text-secondary text-sm font-medium mb-2">
        Receipt Image
      </label>

      {/* Upload Area */}
      {!imagePreview && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
            ${dragActive ? 'border-accent bg-accent/10' : 'border-secondary hover:border-accent/50'}
            ${error ? 'border-error' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            id="receipt-upload"
          />
          
          <div className="space-y-4">
            <div className="text-accent text-5xl">📄</div>
            <div>
              <p className="text-text-primary font-medium mb-2">
                Drag and drop your receipt here
              </p>
              <p className="text-text-secondary text-sm mb-4">
                or
              </p>
              <label
                htmlFor="receipt-upload"
                className="inline-block px-6 py-2 bg-secondary border-2 border-accent text-accent rounded-lg
                  hover:bg-accent hover:text-primary cursor-pointer transition-all duration-300"
              >
                Browse Files
              </label>
            </div>
            <p className="text-text-secondary text-xs">
              Supported formats: JPG, PNG, GIF, WEBP (Max 5MB)
            </p>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="space-y-4">
          <div className="relative bg-secondary rounded-lg p-4 border-2 border-secondary">
            <img
              src={imagePreview}
              alt="Receipt preview"
              className="max-h-64 mx-auto rounded-lg"
            />
            
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-error text-white rounded-full w-8 h-8 flex items-center justify-center
                hover:shadow-[0_0_20px_rgba(255,51,102,0.5)] transition-all duration-300"
              type="button"
              disabled={uploading || processing}
            >
              ✕
            </button>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Uploading receipt...</span>
                <span className="text-accent font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Success */}
          {uploadedFileUrl && !uploading && (
            <div className="p-3 bg-success/10 border border-success rounded-lg flex items-center gap-2">
              <span className="text-success text-xl">✓</span>
              <span className="text-success text-sm font-medium">Receipt uploaded successfully</span>
            </div>
          )}

          {/* Process Button */}
          {!extractedData && !processing && !uploading && uploadedFileUrl && (
            <button
              onClick={handleProcessReceipt}
              className="w-full px-6 py-3 bg-gradient-to-r from-accent to-accent-secondary text-white rounded-lg
                font-semibold hover:shadow-glow transition-all duration-300"
              type="button"
            >
              🔍 Process Receipt with OCR
            </button>
          )}

          {/* Processing Indicator */}
          {processing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Processing receipt...</span>
                <span className="text-accent font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Extracted Data Display */}
          {extractedData && (
            <div className="bg-secondary rounded-lg p-4 border-2 border-accent/30 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-text-primary font-semibold">Extracted Data</h3>
                <span className="text-xs text-text-secondary">
                  Overall Confidence: {Math.round(extractedData.confidence)}%
                </span>
              </div>

              {/* Vendor */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-text-secondary text-sm">Vendor</p>
                  <p className="text-text-primary font-medium">
                    {extractedData.vendor || 'Not detected'}
                  </p>
                </div>
                <span className={`text-xs font-medium ${getConfidenceColor(extractedData.fieldConfidence.vendor)}`}>
                  {getConfidenceLabel(extractedData.fieldConfidence.vendor)}
                </span>
              </div>

              {/* Amount */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-text-secondary text-sm">Amount</p>
                  <p className="text-text-primary font-medium">
                    {extractedData.amount ? `$${extractedData.amount.toFixed(2)}` : 'Not detected'}
                  </p>
                </div>
                <span className={`text-xs font-medium ${getConfidenceColor(extractedData.fieldConfidence.amount)}`}>
                  {getConfidenceLabel(extractedData.fieldConfidence.amount)}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-text-secondary text-sm">Date</p>
                  <p className="text-text-primary font-medium">
                    {extractedData.date || 'Not detected'}
                  </p>
                </div>
                <span className={`text-xs font-medium ${getConfidenceColor(extractedData.fieldConfidence.date)}`}>
                  {getConfidenceLabel(extractedData.fieldConfidence.date)}
                </span>
              </div>

              {/* Suggested Category */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-text-secondary text-sm">Suggested Category</p>
                  <p className="text-text-primary font-medium capitalize">
                    {extractedData.category.replace('_', ' ')}
                  </p>
                </div>
                <span className="text-xs font-medium text-accent">
                  AI Suggested
                </span>
              </div>

              {/* Manual Correction Note */}
              <div className="mt-4 pt-3 border-t border-secondary">
                <p className="text-text-secondary text-xs">
                  💡 You can manually correct any extracted values in the form below
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-error/10 border border-error rounded-lg">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ReceiptUpload;
