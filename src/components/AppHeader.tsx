import { Play, Square, Trash2, Download, Upload, Code2 } from "lucide-react";
import type { RunStatus } from "@/hooks/use-pyodide";

interface AppHeaderProps {
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
  onDownload: () => void;
  onUpload: () => void;
  status: RunStatus;
  language: "python" | "javascript";
}

export function AppHeader({ onRun, onStop, onClear, onDownload, onUpload, language }: AppHeaderProps) {
  return (
    <header className="glass sticky top-0 z-30 px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shadow-[var(--shadow-glow)]">
          {language === "python" ? (
            <span className="text-lg">🐍</span>
          ) : (
            <Code2 className="w-5 h-5 text-yellow-400" />
          )}
        </div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-bold gradient-text tracking-tight leading-tight">
            {language === "python" ? "Python" : "JavaScript"}
          </h1>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {language === "python" ? "Pyodide WASM" : "Browser V8"}
          </p>
        </div>
      </div>

      <nav className="flex items-center gap-1.5" aria-label="Editor controls">
        <RunButton onRun={onRun} />
        <IconBtn icon={Square} label="Stop" onClick={onStop} variant="destructive" />
        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
        <IconBtn icon={Trash2} label="Clear output" onClick={onClear} />
        <IconBtn icon={Upload} label="Upload file" onClick={onUpload} />
        <IconBtn icon={Download} label="Download file" onClick={onDownload} />
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
      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm
        hover:brightness-110 active:scale-95 transition-all shadow-[var(--shadow-glow)]
        hover:shadow-[0_0_30px_hsl(174,72%,52%,0.5)]"
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
      className={`p-2.5 rounded-xl transition-all active:scale-95
        ${variant === "destructive"
          ? "text-destructive hover:bg-destructive/10"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
