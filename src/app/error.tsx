'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#040714',
        color: '#f8fafc',
        fontFamily: 'system-ui, sans-serif',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '32px',
          borderRadius: '16px',
          background: 'rgba(13, 20, 52, 0.8)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '24px', lineHeight: 1.6 }}>
          An unexpected condition occurred while loading the page.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #00f0ff, #a855f7)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              padding: '10px 20px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
