// The error.tsx file can be use to define a UI boundary for a route segment. It serves as a catch-all for unexpected errors and
// allows you to display a fallback UI to your users.
'use client';
// error.tsx needs to be a Client Component

import { useEffect } from 'react';

// Inside your /dashboard/invoices folder, create a new file called error.tsx and paste the following code
export default function Error({
  error,
  reset,
}: {
  // This object is an instance of Javascript's native Error object
  error: Error & { digest?: string };
  // This is a function to reset the error boundary. When executed, the function will try to re-render the route segment
  reset: () => void;
}) {
  // optionally log the error to an error reporting service
  useEffect(() => {
    console.log(error);
  }, [error]);

  // When an error occur inside /dashboard/invoices page folders, you should see the following UI
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Something went wrong!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={
          // Attempt to recover by trying to re-render the invoices routes
          () => reset()
        }
      >
        Try again
      </button>
    </main>
  );
}
