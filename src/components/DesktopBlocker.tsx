import { useState, useEffect } from 'react';

export default function DesktopBlocker() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => {
      // Block if screen width is wider than a typical mobile/tablet portrait
      setIsDesktop(window.innerWidth > 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isDesktop) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'linear-gradient(135deg, #2D4A3E 0%, #1a2e26 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
        maxWidth: '420px',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📱</div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
          lineHeight: 1.3,
        }}>
          Mobile Only
        </h1>
        <p style={{
          fontSize: '1.05rem',
          color: '#A8C5B8',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}>
          Habit Streak Tracker is designed for mobile devices.
          Please open this site on your phone for the best experience.
        </p>
        <div style={{
          background: 'rgba(168, 197, 184, 0.15)',
          borderRadius: '1rem',
          padding: '1.25rem',
          border: '1px solid rgba(168, 197, 184, 0.25)',
        }}>
          <p style={{ fontSize: '0.9rem', color: '#c3d9cf', margin: 0, lineHeight: 1.6 }}>
            Open <strong style={{ color: '#fff' }}>{window.location.hostname}</strong> on your phone's browser to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
