'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #1a0a2e, #16213e)',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            background: 'rgba(0,0,0,0.5)',
            border: '2px solid #a855f7',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              ⚠️
            </div>

            <h2 style={{
              color: 'white',
              fontSize: '24px',
              marginBottom: '16px'
            }}>
              CRITICAL SYSTEM ERROR
            </h2>

            <p style={{
              color: '#c4b5fd',
              marginBottom: '24px'
            }}>
              A critical error occurred. Please refresh the page.
            </p>

            <button
              onClick={reset}
              style={{
                background: 'linear-gradient(to right, #9333ea, #db2777)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              RELOAD PAGE
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
