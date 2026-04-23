'use client';

export default function OfflinePage() {
  return (
    <div style={{
      background: '#0a0a0a',
      color: '#ededed',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          background: '#6d28d9',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
            <line x1="12" y1="2" x2="12" y2="12" />
          </svg>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
          You&apos;re Offline
        </h1>
        <p style={{ color: '#71717a', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          Pure Advance ERP can&apos;t reach the server right now.
          Your cached data is still available.
        </p>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#27272a',
          border: '1px solid #3f3f46',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '12px',
          color: '#a1a1aa',
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          No connection
        </div>

        <br />
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            background: '#6d28d9',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
