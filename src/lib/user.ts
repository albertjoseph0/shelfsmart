import { prisma } from '@/lib/prisma'; // Adjust path if your prisma client export is elsewhere

/**
 * Checks if a user has an active subscription status in the database.
 * @param userId - The Clerk user ID.
 * @returns True if the user's account status is "ACTIVE", false otherwise.
 */
export async function getSubscriptionStatus(userId: string): Promise<boolean> {
  if (!userId) {
    return false; // Cannot check status without a userId
  }

  try {
    const account = await prisma.account.findUnique({
      where: { userId: userId },
      select: { status: true }, // Only select the status field for efficiency
    });

    // Check if account exists and status is not equal to "INACTIVE"
    return account?.status !== "INACTIVE";

  } catch (error) {
    console.error(`Error fetching subscription status for userId ${userId}:`, error);
    return false; // Default to false in case of error
  }
} 