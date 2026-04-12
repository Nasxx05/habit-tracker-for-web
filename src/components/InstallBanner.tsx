import { useState } from 'react';

export default function InstallBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('install-banner-dismissed') === 'true';
  });

  // Don't show if already installed as standalone PWA
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;

  if (dismissed || isStandalone) return null;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('install-banner-dismissed', 'true');
  };

  return (
    <div className="animate-slide-down" style={{
      margin: '0.75rem',
      marginBottom: 0,
      padding: '0.875rem 1rem',
      background: 'linear-gradient(135deg, #2D4A3E, #3a6152)',
      borderRadius: '0.875rem',
      color: 'white',
      position: 'relative',
    }}>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.65rem',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '1.15rem',
          cursor: 'pointer',
          padding: '0.25rem',
          lineHeight: 1,
        }}
      >
        ✕
      </button>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
        <span style={{ fontSize: '1.35rem', flexShrink: 0, marginTop: '0.1rem' }}>💡</span>
        <div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
            Add to Home Screen
          </p>
          {isIOS ? (
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#c3d9cf', lineHeight: 1.5 }}>
              Tap the <strong>Share</strong> button <span style={{ fontSize: '0.9em' }}>⬆</span> in Safari, then select <strong>"Add to Home Screen"</strong> for a full app experience.
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#c3d9cf', lineHeight: 1.5 }}>
              Tap the <strong>menu ⋮</strong> in your browser, then select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong> for a full app experience.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
