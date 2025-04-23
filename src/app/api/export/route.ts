import { prisma } from '@/lib/prisma'; // Import prisma client
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Remove the old db import
// import { getAllBooks } from '../../../lib/db';

// GET /api/export - Export books as CSV
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Fetch books using Prisma
    const books = await prisma.book.findMany({
      where: { userId },
      orderBy: {
        dateAdded: 'desc',
      },
    });
    return NextResponse.json({ books });
  } catch (error) {
    console.error('Error exporting books:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 