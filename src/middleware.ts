import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/upload(.*)',        // Protect the upload page
  '/packages(.*)',       // Protect the packages page
  '/api/checkout_sessions(.*)', // Protect the checkout API route
  // Add any other routes that require login here (e.g., '/dashboard(.*)')
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect routes explicitly listed in isProtectedRoute
  if (isProtectedRoute(req)) {
    await auth.protect(); // Redirect unauthenticated users to sign-in
  }
  
  // Routes not listed in isProtectedRoute (like '/', '/sign-in', '/api/webhooks/stripe') 
  // will be publicly accessible by default.
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};