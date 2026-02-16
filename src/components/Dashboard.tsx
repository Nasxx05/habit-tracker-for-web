import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { formatDisplayDate, getGreeting } from '../utils/dateHelpers';
import HabitCard from './HabitCard';
import AddHabitModal from './AddHabitModal';

const MOTIVATIONAL_MESSAGES = [
  '🔥 Keep your streak alive!',
  '💪 You got this!',
  '⭐ Make today count!',
  '🚀 Small steps, big results!',
  '🌟 Consistency is key!',
  '🎯 Stay focused!',
];

export default function Dashboard() {
  const { habits, completedToday, totalHabits } = useHabits();
  const [showAddModal, setShowAddModal] = useState(false);

  const greeting = getGreeting();
  const today = new Date();
  const message = MOTIVATIONAL_MESSAGES[today.getDate() % MOTIVATIONAL_MESSAGES.length];

  const allDone = totalHabits > 0 && completedToday === totalHabits;

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Date & Motivation */}
      <section className="px-4 py-5 bg-gradient-to-r from-purple-50 to-blue-50">
        <p className="text-gray-500 text-sm">{formatDisplayDate(today)}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-lg font-semibold text-purple-700">
            {allDone ? '🎉 All habits done! Amazing!' : message}
          </p>
        </div>
        {totalHabits > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedToday / totalHabits) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-500">
              {completedToday}/{totalHabits}
            </span>
          </div>
        )}
      </section>

      {/* Habits List */}
      <section className="px-4 pt-4">
        {habits.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{greeting.emoji}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No habits yet!</h2>
            <p className="text-gray-500 mb-6">
              Start by adding your first habit to track.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-purple-700 transition cursor-pointer"
            >
              + Add Your First Habit
            </button>
          </div>
        ) : (
          <>
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </>
        )}

        {/* Add Habit Button */}
        {habits.length > 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-purple-600 text-white font-semibold py-4 rounded-xl shadow-md hover:bg-purple-700 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <span className="text-xl">+</span>
            <span>Add New Habit</span>
          </button>
        )}
      </section>

      <AddHabitModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
