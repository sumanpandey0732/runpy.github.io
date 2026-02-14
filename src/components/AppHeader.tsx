import { Play, Square, Trash2, Download, Upload } from "lucide-react";
import type { RunStatus } from "@/hooks/use-pyodide";

interface AppHeaderProps {
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
  onDownload: () => void;
  onUpload: () => void;
  status: RunStatus;
}

export function AppHeader({ onRun, onStop, onClear, onDownload, onUpload }: AppHeaderProps) {
  return (
    <header className="glass sticky top-0 z-30 px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <span className="gradient-text font-bold text-lg">🐍</span>
        </div>
        <h1 className="text-lg font-bold gradient-text tracking-tight hidden sm:block">python</h1>
      </div>

      <nav className="flex items-center gap-1.5" aria-label="Editor controls">
        <RunButton onRun={onRun} />
        <IconBtn icon={Square} label="Stop" onClick={onStop} variant="destructive" />
        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
        <IconBtn icon={Trash2} label="Clear output" onClick={onClear} />
        <IconBtn icon={Upload} label="Upload .py" onClick={onUpload} />
        <IconBtn icon={Download} label="Download .py" onClick={onDownload} />
      </nav>

      <div className="w-20" />
    </header>
  );
}

function RunButton({ onRun }: { onRun: () => void }) {
  return (
    <button
      onClick={onRun}
      aria-label="Run code"
      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm
        hover:brightness-110 active:scale-95 transition-all glow-primary"
    >
      <Play className="w-4 h-4 fill-current" />
      <span className="hidden sm:inline">Run</span>
    </button>
  );
}

function IconBtn({
  icon: Icon,
  label,
  onClick,
  variant,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "destructive";
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`p-2 rounded-lg transition-all hover:bg-secondary active:scale-95
        ${variant === "destructive" ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:text-foreground"}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
