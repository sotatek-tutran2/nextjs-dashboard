// Another way you can handle errors gracefully is by using the notFound function. While error.tsx is useful for catching all
// error, notFound can be used when you try to fetch a resource that doesn't exist

// If you visit a fake UUID in invoice edit page, you'll immediately see error.tsx kicks in because
// this is a child route of /invoices where error.tsx is defined

// However, if you want to be more specific, you can show a 404 error to tell the user the resource they're trying to access hasn't been found
import Link from 'next/link';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

// <Page> will now throw an error if a specific invoice is not found. To show an error UI to the user
// Create a not-found.tsx file inside the /edit folder

export default function NotFound() {
  // That's something to keep in mind, notFound will take precedence over error.tsx, so you can reach out for it when
  // you want to handle more specific errors!
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <FaceFrownIcon className="w-10 text-gray-400" />
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p>Could not find the requested invoice.</p>
      <Link
        href="/dashboard/invoices"
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
      >
        Go Back
      </Link>
    </main>
  );
}

// Which file in Next.js serves as a catch-all for unexpected errors in your route segments? --> error.tsx

/* More docs
    Errors can be divided into two categories: expected errors ad uncaught exceptions
       - Model expected errors as return values: Avoid using try/catch for expected errors
         in Server Actions. Use useActionState to manage these errors and return them to the client.
       - Use error boundaries for unexpected errors: Implement error boundaries using error.tsx and global-error.tsx files
         to handle unexpected errors and provide a fallback UI.

*/
