import { useEffect, useRef, useState } from 'react';
import type { Habit } from '../types/habit';

interface Props {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareCardModal({ habit, isOpen, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    const accent = habit.color || '#6C5CE7';
    grad.addColorStop(0, '#F0EDF6');
    grad.addColorStop(1, '#EDE9FC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Top accent bar
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, W, 16);

    // Emoji
    ctx.font = '180px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(habit.emoji, W / 2, 220);

    // Habit name
    ctx.fillStyle = '#2C2C2C';
    ctx.font = 'bold 64px Inter, sans-serif';
    ctx.fillText(habit.name, W / 2, 360);

    // Big streak number
    ctx.fillStyle = accent;
    ctx.font = 'bold 320px Inter, sans-serif';
    ctx.fillText(String(habit.currentStreak), W / 2, 600);

    // "DAY STREAK"
    ctx.fillStyle = '#8A8A8A';
    ctx.font = 'bold 40px Inter, sans-serif';
    ctx.fillText('DAY STREAK', W / 2, 780);

    // Stats row
    ctx.fillStyle = '#2C2C2C';
    ctx.font = 'bold 56px Inter, sans-serif';
    const colW = W / 2;
    ctx.fillText(String(habit.longestStreak), colW * 0.5, 900);
    ctx.fillText(String(habit.completionDates.length), colW * 1.5, 900);

    ctx.fillStyle = '#8A8A8A';
    ctx.font = '32px Inter, sans-serif';
    ctx.fillText('LONGEST', colW * 0.5, 950);
    ctx.fillText('TOTAL', colW * 1.5, 950);

    // Footer brand
    ctx.fillStyle = accent;
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText('Streakly', W / 2, 1030);

    setDataUrl(canvas.toDataURL('image/png'));
  }, [isOpen, habit]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `streakly-${habit.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  const handleShare = async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'streakly.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My Streakly progress' });
        return;
      }
    } catch { /* fall through */ }
    handleDownload();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-[60] animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Share Progress</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-mint text-muted text-xl cursor-pointer">×</button>
        </div>

        <div className="bg-cream rounded-2xl p-3 mb-4">
          {dataUrl ? (
            <img src={dataUrl} alt="Progress card" className="w-full rounded-xl" />
          ) : (
            <div className="aspect-square flex items-center justify-center text-muted">Generating…</div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-2">
          <button onClick={handleShare} className="flex-1 bg-forest text-white font-semibold py-3 rounded-xl hover:bg-forest/90 transition cursor-pointer">
            Share
          </button>
          <button onClick={handleDownload} className="flex-1 bg-mint text-forest font-semibold py-3 rounded-xl hover:bg-sage-light transition cursor-pointer">
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
