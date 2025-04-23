'use client';

import { useState } from 'react';
import { unparse } from 'papaparse';

export default function ExportButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch books for export
      const response = await fetch('/api/export');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export books');
      }
      
      const { books } = await response.json();
      
      if (!books || books.length === 0) {
        setError('No books to export');
        return;
      }
      
      // Convert to CSV using PapaParse
      // Explicitly type 'book' to fix lint error
      type Book = {
        title: string;
        author?: string;
        isbn10?: string;
        isbn13?: string;
        dateAdded?: string | Date;
      };
      const csv = unparse(
        (books as Book[]).map((book: Book) => ({
          Title: book.title,
          Author: book.author || '',
          ISBN10: book.isbn10 || '',
          ISBN13: book.isbn13 || '',
          'Date Added': book.dateAdded
            ? new Date(book.dateAdded).toISOString().split('T')[0]
            : ''
        }))
      );
      
      // Create a blob and download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set up download
      link.setAttribute('href', url);
      link.setAttribute('download', `books-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      // Append to document, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error exporting books:', err);
      setError(err instanceof Error ? err.message : 'Failed to export books');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-4">
      <button
        onClick={handleExport}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export as CSV
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 p-2 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
} 