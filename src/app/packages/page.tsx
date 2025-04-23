'use client';

import { useState } from 'react';

export default function Packages() {
  // State to track which plan is being processed
  const [processingPlan, setProcessingPlan] = useState<string | null>(null); 

  // Price IDs from .env.local (hardcoded for client component simplicity)
  const priceIds = {
    starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!,
    scholar: process.env.NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID!,
    savant: process.env.NEXT_PUBLIC_STRIPE_SAVANT_PRICE_ID!
  };

  // Function to handle checkout button clicks
  const handleCheckout = async (planKey: keyof typeof priceIds) => {
    const priceId = priceIds[planKey];
    if (!priceId) {
      console.error('Price ID not found for plan:', planKey);
      alert('Error initiating checkout. Price ID missing.');
      return;
    }
    setProcessingPlan(planKey); // Set loading state for this plan

    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error(`Checkout session creation failed: ${response.statusText}`);
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error('Checkout URL not received from server.');
      }

      // Redirect to Stripe Checkout
      window.location.href = url;

    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Error initiating checkout: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProcessingPlan(null); // Reset loading state on error
    } 
    // Note: We don't reset processingPlan on success because the page redirects.
  };

  return (
    <main className="min-h-screen bg-white flex flex-col justify-center">
      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Pricing Plans</h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Turn your bookshelf into a brilliant digital catalog. Choose the plan that makes your library shine!
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition p-6 flex flex-col h-full">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">ShelfSmart Starter</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-blue-600">$10.99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="font-medium text-gray-600 mb-4">Catalog up to 5 bookshelf photos</p>
              <p className="text-gray-600 mb-6 italic">A clever way to begin organizing your books digitally.</p>
              
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Simple photo upload</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Complete book details (titles, authors, ISBNs)</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Easy CSV export for Libib, BookBuddy, and more</span>
                </li>
              </ul>
              
              <p className="text-gray-600 text-sm italic mb-6">Perfect for small collections or testing the waters.</p>
              
              <button 
                onClick={() => handleCheckout('starter')}
                disabled={!!processingPlan} // Disable if any plan is processing
                className={`mt-auto bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 transition text-center w-full ${
                  processingPlan ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  processingPlan === 'starter' ? 'animate-pulse' : '' // Optional pulse animation
                }`}
              >
                {processingPlan === 'starter' ? 'Processing...' : 'Get Started'}
              </button>
            </div>
            
            {/* Scholar Plan */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition p-6 flex flex-col h-full">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">ShelfSmart Scholar</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-blue-600">$22.99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="font-medium text-gray-600 mb-4">Catalog up to 10 bookshelf photos</p>
              <p className="text-gray-600 mb-6 italic">A sharp choice for building a smarter library catalog.</p>
              
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Everything in ShelfSmart Starter</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Basic image enhancement for better book recognition</span>
                </li>
              </ul>
              
              <p className="text-gray-600 text-sm italic mb-6">Great for growing collections needing a bit more.</p>
              
              <button 
                onClick={() => handleCheckout('scholar')}
                disabled={!!processingPlan}
                className={`mt-auto bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 transition text-center w-full ${
                  processingPlan ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  processingPlan === 'scholar' ? 'animate-pulse' : '' 
                }`}
              >
                {processingPlan === 'scholar' ? 'Processing...' : 'Get Started'}
              </button>
            </div>
            
            {/* Savant Plan (Most Popular) */}
            <div className="bg-blue-50 border-2 border-blue-600 rounded-lg shadow-lg hover:shadow-xl transition p-6 flex flex-col h-full relative">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                Most Popular
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">ShelfSmart Savant</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-blue-600">$29.99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="font-medium text-gray-600 mb-4">Catalog unlimited bookshelf photos</p>
              <p className="text-gray-600 mb-6 italic">The wisest way to master your entire library with ease.</p>
              
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Everything in ShelfSmart Scholar</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Premium image enhancement for crystal-clear scans</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority processing for instant results</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Monthly "ShelfSmart Summary" (a visual overview of your catalog)</span>
                </li>
              </ul>
              
              <p className="text-gray-600 text-sm italic mb-6">Don't let a single book go uncataloged—unlimited smarts for just $7 more!</p>
              
              <button 
                onClick={() => handleCheckout('savant')}
                disabled={!!processingPlan}
                className={`mt-auto bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 transition text-center w-full ${
                  processingPlan ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  processingPlan === 'savant' ? 'animate-pulse' : '' 
                }`}
              >
                {processingPlan === 'savant' ? 'Processing...' : 'Get Started'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 