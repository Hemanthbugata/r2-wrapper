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
    } catch (err: unknown) {
      // Fixed: Better error handling with proper typing
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-8">Cloudflare R2 File Uploader</h1>
      
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Select a file to upload
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
            disabled={uploading}
          />
        </div>
        
        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {uploadResult && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Upload Successful!</h2>
          <p><strong>Filename:</strong> {uploadResult.fileName}</p>
          <p><strong>Size:</strong> {Math.round(uploadResult.fileSize / 1024)} KB</p>
          <p><strong>Type:</strong> {uploadResult.mimeType}</p>
          <p>
            <strong>URL:</strong>{' '}
            <a
              href={uploadResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {uploadResult.url}
            </a>
          </p>
        </div>
      )}
    </main>
  );
}
