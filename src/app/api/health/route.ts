import { NextResponse } from 'next/server';

export async function GET() {
  // You can add more checks here (e.g., DB connection) for a real healthcheck
  try {
    // If you want to check DB, external services, etc., do it here
    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    return new NextResponse('Unhealthy', { status: 500 });
  }
} 