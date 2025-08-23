'use client';

import { useEffect } from 'react';
import { Button } from '../components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error in development mode only
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Oups ! Une erreur s'est produite
        </h1>
        <p className="text-gray-600 mb-6">
          Nous nous excusons pour ce désagrément. Veuillez réessayer.
        </p>
        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            Réessayer
          </Button>
          <a href="/">
            <Button variant="outline" className="w-full">
              Retour à l'accueil
            </Button>
          </a>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Détails de l'erreur (développement)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
