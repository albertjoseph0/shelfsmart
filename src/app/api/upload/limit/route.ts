import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserUploadLimit, getUserImageCount } from '../limitUtils';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { limit } = await getUserUploadLimit(userId);
  const imageCount = await getUserImageCount(userId);

  return NextResponse.json({ count: imageCount, limit });
}
