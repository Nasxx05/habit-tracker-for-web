import { useState } from 'react';
import { HabitProvider, useHabits } from './context/HabitContext';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

function AppContent() {
  const { currentView } = useHabits();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (currentView === 'welcome') {
    return <WelcomeScreen />;
  }

  return (
    <div className="min-h-dvh bg-white">
      <Header onToggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'calendar' && <Calendar />}
      </main>
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
