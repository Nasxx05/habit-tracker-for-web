import { useHabits } from '../context/HabitContext';

export default function UndoToast() {
  const { undoAction, executeUndo, dismissUndo, habits } = useHabits();

  if (!undoAction) return null;

  const habit = undoAction.type === 'delete'
    ? undoAction.habitData
    : habits.find((h) => h.id === undoAction.habitId);

  const message = undoAction.type === 'delete'
    ? `"${undoAction.habitData?.name}" deleted`
    : habit
      ? `"${habit.name}" ${habit.isCompletedToday ? 'completed' : 'uncompleted'}`
      : 'Action performed';

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex justify-center animate-toast-in">
      <div className="bg-dark text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm w-full">
        <span className="text-sm flex-1 truncate">{message}</span>
        <button
          onClick={executeUndo}
          className="text-peach font-bold text-sm cursor-pointer hover:text-peach-light transition whitespace-nowrap"
        >
          Undo
        </button>
        <button
          onClick={dismissUndo}
          className="text-muted hover:text-white text-sm cursor-pointer transition"
        >
          ×
        </button>
      </div>
    </div>
  );
}
