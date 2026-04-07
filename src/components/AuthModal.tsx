import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
    } else {
      handleClose();
    }
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
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full px-4 py-3 pr-16 bg-cream rounded-xl text-dark text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sage placeholder:text-muted/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-muted hover:text-dark cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center mb-3">{error}</p>
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
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
          className="w-full mt-3 py-2.5 text-muted text-sm font-medium hover:text-dark transition cursor-pointer"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
