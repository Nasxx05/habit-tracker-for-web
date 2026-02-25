import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [closing, setClosing] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    let err: string | null;
    if (mode === 'signin') {
      err = await signInWithEmail(email, password);
    } else {
      err = await signUpWithEmail(email, password);
    }

    setLoading(false);
    if (err) {
      setError(err);
    } else if (mode === 'signup') {
      setSuccess('Check your email to confirm your account.');
    } else {
      handleClose();
    }
  };

  const handleGoogle = async () => {
    setError('');
    const err = await signInWithGoogle();
    if (err) setError(err);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div
        className={`relative w-full max-w-lg bg-white rounded-t-3xl px-6 pt-3 pb-8 ${closing ? 'celebration-sheet-out' : 'celebration-sheet-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-mint rounded-2xl text-3xl mb-3">
            {mode === 'signin' ? '🔐' : '🆕'}
          </div>
          <h2 className="text-xl font-bold text-dark">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-muted text-sm mt-1">Sync your streaks across devices</p>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          className="w-full py-3 bg-white border-2 border-gray-200 rounded-2xl font-medium text-dark text-sm flex items-center justify-center gap-2 hover:bg-cream transition cursor-pointer mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-muted">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3 bg-cream rounded-xl text-dark text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sage placeholder:text-muted/50 mb-3"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full px-4 py-3 bg-cream rounded-xl text-dark text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sage placeholder:text-muted/50 mb-4"
          />

          {error && (
            <p className="text-sm text-red-500 text-center mb-3">{error}</p>
          )}
          {success && (
            <p className="text-sm text-forest text-center mb-3">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-forest text-white font-semibold rounded-2xl hover:bg-forest/90 transition cursor-pointer text-base disabled:opacity-50"
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess(''); }}
          className="w-full mt-3 py-2.5 text-muted text-sm font-medium hover:text-dark transition cursor-pointer"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
