import { prisma } from '@/lib/prisma'; // Import prisma client
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Define input shape for incoming books
type BookInput = {
  title: string;
  author?: string | null;
  isbn10?: string | null;
  isbn13?: string | null;
  imageId?: string | null;
};

// GET /api/books - Fetch all books
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Fetch books using Prisma
    // Fetch only books belonging to the authenticated user
    const books = await prisma.book.findMany({
      where: { userId },
      orderBy: {
        dateAdded: 'desc',
      },
    });
    return NextResponse.json({ books });
  } catch (error) {
    console.error('Error fetching books:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/books - Add a new book or multiple books
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const requestData = await request.json();

    // Check if the request is for adding multiple books
    if (Array.isArray(requestData.books)) {
      // Add multiple books using Prisma
      const booksData = (requestData.books as BookInput[]).map((book: BookInput) => ({
        title: book.title,
        author: book.author || null,
        isbn10: book.isbn10 || null,
        isbn13: book.isbn13 || null,
        imageId: book.imageId || null,
        userId, // Assign the authenticated user's userId
        // Prisma handles default for dateAdded and generates id
      }));
      
      const newBooks = await prisma.book.createMany({
        data: booksData,
        // skipDuplicates: true, // Removed due to type error/compatibility
      });
      
      // Note: createMany returns a count, not the created records.
      // If you need the created records, you might need to query them again or use individual create calls in a transaction.
      return NextResponse.json({ count: newBooks.count }, { status: 201 });

    } else {
      // Add a single book using Prisma
      const { title, author, isbn10, isbn13, imageId } = requestData;
      if (!title) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      }
      
      const newBook = await prisma.book.create({
        data: {
          title,
          author: author || null,
          isbn10: isbn10 || null,
          isbn13: isbn13 || null,
          imageId: imageId || null,
          userId, // Assign the authenticated user's userId
          // Prisma handles default for dateAdded and generates id
        },
      });
      return NextResponse.json(newBook, { status: 201 });
    }
  } catch (error) {
    console.error('Error adding book(s):', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 