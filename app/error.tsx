'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">Something went wrong!</h2>
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
