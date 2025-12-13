'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/50 rounded-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-lg flex items-center justify-center border-2 border-red-500">
          <span className="text-4xl">⚠️</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          SYSTEM ERROR
        </h2>

        <p className="text-purple-300 mb-6">
          Something went wrong! The system encountered an unexpected error.
        </p>

        {error.message && (
          <div className="mb-6 p-4 bg-black/30 rounded border border-red-500/30">
            <p className="text-sm text-red-400 font-mono">{error.message}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
          >
            TRY AGAIN
          </Button>

          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full border-purple-500/50"
          >
            RETURN TO HOME
          </Button>
        </div>
      </div>
    </div>
  );
}
