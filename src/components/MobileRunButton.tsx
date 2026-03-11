import { Play } from "lucide-react";

interface MobileRunButtonProps {
  onRun: () => void;
}

export function MobileRunButton({ onRun }: MobileRunButtonProps) {
  return (
    <button
      onClick={onRun}
      aria-label="Run code"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl flex items-center justify-center
        bg-primary text-primary-foreground shadow-[var(--shadow-glow)]
        hover:brightness-110 active:scale-90 transition-all
        hover:shadow-[0_0_40px_hsl(174,72%,52%,0.6)]
        animate-float md:hidden"
    >
      <Play className="w-6 h-6 fill-current" />
    </button>
  );
}
