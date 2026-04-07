import { Component, type ReactNode, type ErrorInfo } from 'react';
import { HabitProvider, useHabits } from './context/HabitContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PremiumProvider } from './context/PremiumContext';
import { ThemeProvider } from './context/ThemeContext';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import HabitDetail from './components/HabitDetail';
import Profile from './components/Profile';
import Stats from './components/Stats';
import WeeklyReview from './components/WeeklyReview';
import BottomNav from './components/BottomNav';
import UndoToast from './components/UndoToast';
import TutorialGuide from './components/TutorialGuide';
import DesktopBlocker from './components/DesktopBlocker';
import InstallBanner from './components/InstallBanner';
import StreakFreezeBanner from './components/StreakFreezeBanner';
import StreakLossOverlay from './components/StreakLossOverlay';
import StreakBadgeToast from './components/StreakBadgeToast';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>{this.state.error?.message}</p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{ padding: '0.75rem 1.5rem', background: '#2D4A3E', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', marginRight: '0.5rem' }}
          >
            Reset App Data
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '0.75rem 1.5rem', background: '#A8C5B8', color: '#2D4A3E', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function StreakNotifications() {
  const { freezeEvent, streakLossEvent, badgeEvent, dismissFreezeEvent, dismissStreakLossEvent, dismissBadgeEvent } = useHabits();

  return (
    <>
      {freezeEvent && (
        <StreakFreezeBanner
          habitName={freezeEvent.habitName}
          habitEmoji={freezeEvent.habitEmoji}
          freezesLeft={freezeEvent.freezesLeft}
          onDismiss={dismissFreezeEvent}
        />
      )}
      {streakLossEvent && (
        <StreakLossOverlay
          streakCount={streakLossEvent.lostStreak}
          habitName={streakLossEvent.habitName}
          habitEmoji={streakLossEvent.habitEmoji}
          onDismiss={dismissStreakLossEvent}
        />
      )}
      {badgeEvent && (
        <StreakBadgeToast
          milestone={badgeEvent.milestone}
          habitName={badgeEvent.habitName}
          habitEmoji={badgeEvent.habitEmoji}
          onDismiss={dismissBadgeEvent}
        />
      )}
    </>
  );
}

function AppContent() {
  const { currentView } = useHabits();

  if (currentView === 'welcome') {
    return <WelcomeScreen />;
  }

  return (
    <div className="min-h-dvh bg-cream">
      <DesktopBlocker />
      <InstallBanner />
      <main>
        {currentView === 'home' && <Dashboard />}
        {currentView === 'calendar' && <Calendar />}
        {currentView === 'habit-detail' && <HabitDetail />}
        {currentView === 'profile' && <Profile />}
        {currentView === 'stats' && <Stats />}
        {currentView === 'weekly-review' && <WeeklyReview />}
      </main>
      <BottomNav />
      <UndoToast />
      <StreakNotifications />
      {currentView === 'home' && <TutorialGuide />}
    </div>
  );
}

function AppWithAuth() {
  const { user } = useAuth();
  return (
    <PremiumProvider>
      <HabitProvider syncUserId={user?.id ?? null}>
        <AppContent />
      </HabitProvider>
    </PremiumProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppWithAuth />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
