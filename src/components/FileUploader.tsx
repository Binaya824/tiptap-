import React, { useState } from 'react';

export default function FileUploader({setHtmlArray}:{setHtmlArray:React.Dispatch<React.SetStateAction<string[]>>}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadStatus('Uploading...');
      setProgress(0);

      const response = await fetch('http://127.0.0.1:5000/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadStatus('Upload successful');
      setProgress(100);
      console.log(result);
      setHtmlArray(result.html)
    } catch (error) {
      setUploadStatus('Upload failed');
      setProgress(0);
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <input 
        type="file" 
        onChange={handleFileChange} 
        className="block w-full text-sm text-gray-500 
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-50 file:text-blue-700
        hover:file:bg-blue-100"
      />

      {file && (
        <div className="mt-4">
          <p className="text-sm">Selected file: {file.name}</p>
          <p className="text-sm">Size: {(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      <button 
        onClick={handleUpload}
        disabled={!file}
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded 
        hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Upload File
      </button>

      {uploadStatus && (
        <div className="mt-4">
          <p className={`text-sm ${uploadStatus.includes('failed') ? 'text-red-500' : 'text-green-500'}`}>
            {uploadStatus}
          </p>
          {progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}