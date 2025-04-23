import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getSubscriptionStatus } from '@/lib/user'; 
import UploadClientPage from './UploadClientPage'; // Import the client component

export default async function UploadPage() {
  const { userId } = await auth();

  // Middleware should handle the !userId case, but check for safety
  if (!userId) {
     redirect('/sign-in');
  }

  const isActive = await getSubscriptionStatus(userId);

  // If the user is logged in BUT their subscription is not active...
  if (!isActive) {
    // ...redirect them to the packages page to subscribe.
    redirect('/packages');
  }

  // --- User is authenticated AND active: Render the Client Component UI ---
  return <UploadClientPage />;
} 