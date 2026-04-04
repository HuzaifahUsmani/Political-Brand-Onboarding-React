import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: '#F9FAFB',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: 480,
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '2.5rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#8B1A2B" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1C2E5B', marginBottom: '0.5rem' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              An unexpected error occurred. Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#8B1A2B',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
