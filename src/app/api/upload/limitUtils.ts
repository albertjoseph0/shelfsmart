// Utility functions and constants for upload limits
import { prisma } from '@/lib/prisma';

export const PACKAGE_LIMITS: Record<string, number> = {
  free: 5,
  starter: 50,
  pro: 500,
  // Add more package types and limits as needed
};

export async function getUserUploadLimit(userId: string) {
  const account = await prisma.account.findUnique({ where: { userId } });
  const userPackage = account?.package || 'free';
  const limit = PACKAGE_LIMITS[userPackage] ?? PACKAGE_LIMITS['free'];
  return { userPackage, limit };
}

export async function getUserImageCount(userId: string) {
  // Use the proper syntax for counting distinct values
  return await prisma.book.findMany({
    where: { userId, imageId: { not: null } },
    distinct: ['imageId'],
    select: { imageId: true }
  }).then(results => results.length);
}
