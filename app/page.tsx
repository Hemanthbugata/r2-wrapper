'use client';

import { useState } from 'react';

// Define a proper type for the upload result
interface UploadResult {
  success: boolean;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      setUploadResult(result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  return (
  <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex flex-col items-center justify-center">
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          File Uploader
        </h1>
        <p className="text-gray-600">Upload your files to Cloudflare R2</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Choose File
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading}
            />
            {file && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {Math.round(file.size / 1024)} KB
                </p>
              </div>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          {uploading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Uploading...</span>
            </div>
          ) : (
            'Upload File'
          )}
        </button>
      </form>
    </div>
    
    {error && (
      <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl w-full max-w-md">
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      </div>
    )}
    
    {uploadResult && (
      <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl w-full max-w-md">
        <div className="flex items-center space-x-2 mb-4">
          <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <h2 className="text-xl font-bold text-green-800">Upload Successful!</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-green-200">
            <span className="font-semibold text-green-700">Filename:</span>
            <span className="text-green-600 font-mono text-sm">{uploadResult.fileName}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-green-200">
            <span className="font-semibold text-green-700">Size:</span>
            <span className="text-green-600">{Math.round(uploadResult.fileSize / 1024)} KB</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-green-200">
            <span className="font-semibold text-green-700">Type:</span>
            <span className="text-green-600 font-mono text-sm">{uploadResult.mimeType}</span>
          </div>
          
          <div className="pt-3">
            <span className="font-semibold text-green-700 block mb-2">File URL:</span>
            <a
              href={uploadResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200"
            >
              <span className="break-all">{uploadResult.url}</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    )}
  </main>
);
}
