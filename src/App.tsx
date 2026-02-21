import { HabitProvider, useHabits } from './context/HabitContext';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import HabitDetail from './components/HabitDetail';
import Profile from './components/Profile';
import Stats from './components/Stats';
import WeeklyReview from './components/WeeklyReview';
import BottomNav from './components/BottomNav';
import UndoToast from './components/UndoToast';

function AppContent() {
  const { currentView } = useHabits();

  if (currentView === 'welcome') {
    return <WelcomeScreen />;
  }

  return (
    <div className="min-h-dvh bg-cream">
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
    </div>
  );
}

export default function App() {
  return (
    <HabitProvider>
      <AppContent />
    </HabitProvider>
  );
}
