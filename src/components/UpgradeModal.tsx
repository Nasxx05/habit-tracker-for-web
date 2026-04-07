interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    // Placeholder — payment flow will be wired later
    console.log('Upgrade to Premium clicked');
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-[60] animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-sm p-6 animate-slide-up text-center">
        <div className="text-5xl mb-3">🚀</div>
        <h2 className="text-xl font-bold text-dark mb-2">Free Limit Reached</h2>
        <p className="text-sm text-muted mb-6">
          You've reached the free limit of 3 habits. Upgrade to Premium to track unlimited habits. 🚀
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleUpgrade}
            className="w-full bg-forest text-white font-semibold py-3 rounded-xl hover:bg-forest/90 transition cursor-pointer"
          >
            Upgrade to Premium
          </button>
          <button
            onClick={onClose}
            className="w-full bg-mint text-forest font-semibold py-3 rounded-xl hover:bg-sage-light transition cursor-pointer"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
