'use client';

import React, { useState, useRef } from 'react';

interface ImageUploadProps {
  onBooksAdded: () => void;
}

export default function ImageUpload({ onBooksAdded }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [limit, setLimit] = useState<number | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch the user's limit and count
  const fetchLimit = async () => {
    try {
      const res = await fetch('/api/upload/limit');
      if (!res.ok) throw new Error('Failed to fetch upload limit');
      const data = await res.json();
      setLimit(data.limit);
      setCount(data.count);
      if (data.count >= data.limit) {
        setLimitError("You've reached your upload limit. Upgrade your plan to upload more photos.");
      } else {
        setLimitError(null);
      }
    } catch (err) {
      console.error('Error fetching upload limit:', err);
      setLimitError('Unable to fetch upload limit. Try again later.');
    }
  };

  // Fetch on mount
  React.useEffect(() => {
    fetchLimit();
  }, []);



  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setUploadProgress('Converting image...');

      // Convert the image to base64
      const base64Image = await convertToBase64(file);
      
      setUploadProgress('Processing image...');
      
      // Process the image
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to process image');
      }

      const { imageId, imageData } = await uploadResponse.json();
      
      setUploadProgress('Extracting books from image...');
      
      // Extract books from the image
      const extractResponse = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId, imageData }),
      });

      if (!extractResponse.ok) {
        throw new Error('Failed to extract books from image');
      }

      const { books } = await extractResponse.json();
      
      if (!books || books.length === 0) {
        setError('No books were detected in the image');
        setIsLoading(false);
        return;
      }
      
      setUploadProgress(`Found ${books.length} books. Saving to database...`);
      
      // Save the books to the database
      const saveResponse = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ books }),
      });
      
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save books to database');
      }

      // const savedBooks = await saveResponse.json();
      //console.log(`Successfully saved ${savedBooks.length} books to database`);
      
      // Reset form and notify parent
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onBooksAdded();
      setUploadProgress(null);
      // Re-fetch limit after upload
      await fetchLimit();
      
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Error processing image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="w-full max-w-md mx-auto mb-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Bookshelf Image</h2>
      
      <div className="mb-4 flex items-center justify-between bg-gray-50 border border-dashed border-gray-300 rounded-md p-4">
        <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={isLoading || (limit !== null && count !== null && count >= limit)} ref={fileInputRef} className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        {limit !== null && count !== null && (
          <span className="text-sm text-gray-700 font-medium">{count}/{limit}</span>
        )}
        {limitError && (
          <div className="text-sm text-yellow-800 bg-yellow-100 rounded-lg px-2 py-1">{limitError}</div>
        )}
      </div>
      
      {isLoading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full w-full animate-pulse"></div>
          </div>
          <p className="mt-2 text-sm text-gray-600">{uploadProgress}</p>
        </div>
      )}
      
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 