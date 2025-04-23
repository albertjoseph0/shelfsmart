import axios from 'axios';
import { ExtractedBook } from './openai';

// Google Books API base URL
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export interface GoogleBookDetails {
  title: string;
  author: string;
  isbn10?: string;
  isbn13?: string;
}

/**
 * Search for a book in the Google Books API
 * @param book - The extracted book with title and author
 * @returns Book details including ISBN numbers
 */
export async function searchBookDetails(book: ExtractedBook): Promise<GoogleBookDetails> {
  try {
    // Separate encoding of search terms from the query structure
    const titleTerm = encodeURIComponent(book.title.trim());
    const authorTerm = book.author ? encodeURIComponent(book.author.trim()) : '';
    
    // Build the full URL directly to prevent double-encoding
    let url = `${GOOGLE_BOOKS_API_URL}?q=`;
    
    // Add title search term
    url += `intitle:${titleTerm}`;
    
    // Add author search term if available
    if (authorTerm) {
      url += `+inauthor:${authorTerm}`;
    }
    
    // Add other parameters
    url += '&maxResults=1&printType=books';
    
    // For debugging
    console.log('Google Books API URL:', url);
    
    // Make direct API request with fully constructed URL
    const response = await axios.get(url);
    
    // Return empty details if no results
    if (!response.data.items || response.data.items.length === 0) {
      console.log(`No results found for book: "${book.title}" by "${book.author}"`);
      return {
        title: book.title,
        author: book.author,
      };
    }
    
    // Extract book information from the first result
    const bookInfo = response.data.items[0].volumeInfo;
    
    // Extract ISBN numbers
    let isbn10 = undefined;
    let isbn13 = undefined;
    
    if (bookInfo.industryIdentifiers) {
      for (const identifier of bookInfo.industryIdentifiers) {
        if (identifier.type === 'ISBN_10') {
          isbn10 = identifier.identifier;
        } else if (identifier.type === 'ISBN_13') {
          isbn13 = identifier.identifier;
        }
      }
    }
    
    // Log success for debugging
    if (isbn10 || isbn13) {
      console.log(`Found ISBN for "${bookInfo.title}": ISBN-10=${isbn10 || 'N/A'}, ISBN-13=${isbn13 || 'N/A'}`);
    } else {
      console.log(`No ISBN found for "${bookInfo.title}"`);
    }
    
    // Return book details
    return {
      title: bookInfo.title || book.title,
      author: bookInfo.authors ? bookInfo.authors.join(', ') : book.author,
      isbn10,
      isbn13,
    };
    
  } catch (error) {
    console.error(`Error searching for book "${book.title}":`, error);
    // Return the original book info if there was an error
    return {
      title: book.title,
      author: book.author,
    };
  }
}

/**
 * Get details for multiple books
 * @param books - Array of extracted books
 * @returns Array of book details including ISBN numbers
 */
export async function getBooksDetails(books: ExtractedBook[]): Promise<GoogleBookDetails[]> {
  // Process books in parallel with a reasonable concurrency limit
  const booksDetails: GoogleBookDetails[] = [];
  
  // Process books in batches of 5 to avoid rate limiting
  const batchSize = 5;
  
  for (let i = 0; i < books.length; i += batchSize) {
    const batch = books.slice(i, i + batchSize);
    const batchPromises = batch.map(book => searchBookDetails(book));
    
    const batchResults = await Promise.all(batchPromises);
    booksDetails.push(...batchResults);
    
    // Add a small delay between batches
    if (i + batchSize < books.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return booksDetails;
} 