'use client';

import { useState, useEffect } from 'react';
// Import Book type from generated Prisma client
import { Book } from '@/generated/prisma'; 

interface BookTableProps {
  refreshTrigger: number;
}

export default function BookTable({ refreshTrigger }: BookTableProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch books when component mounts or refreshTrigger changes
    fetchBooks();
  }, [refreshTrigger]);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/books');
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const data = await response.json();
      // Extract the books array from the response object
      setBooks(data.books || []); // Use data.books and provide fallback
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date to YYYY-MM-DD
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-100 text-red-700 rounded-lg mb-4">
        {error}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        <p>No books in your library yet. Upload a bookshelf image to get started.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Title
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Author
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              ISBN-10
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              ISBN-13
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Date Added
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {books.map((book) => (
            <tr key={book.id} className="hover:bg-gray-50">
              <td className="py-4 px-4 text-sm text-gray-800">{book.title}</td>
              <td className="py-4 px-4 text-sm text-gray-800">{book.author || '-'}</td>
              <td className="py-4 px-4 text-sm font-mono text-gray-800">{book.isbn10 || '-'}</td>
              <td className="py-4 px-4 text-sm font-mono text-gray-800">{book.isbn13 || '-'}</td>
              <td className="py-4 px-4 text-sm text-gray-800">{formatDate(book.dateAdded)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 