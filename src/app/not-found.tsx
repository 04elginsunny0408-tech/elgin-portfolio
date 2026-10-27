import React from 'react';
import Link from 'next/link';

export default function NotFound() {
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
        <span
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #00f0ff, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'block',
            marginBottom: '8px',
          }}
        >
          404
        </span>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>
          Page Not Found
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '24px' }}>
          The celestial coordinates you requested do not exist in Elgin&apos;s universe.
        </p>
        <Link
          href="/"
          style={{
            padding: '10px 24px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #00f0ff, #a855f7)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Return to Solar System
        </Link>
      </div>
    </div>
  );
}
