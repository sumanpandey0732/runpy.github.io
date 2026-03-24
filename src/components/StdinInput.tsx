import { useState } from "react";
import { ChevronDown, ChevronRight, Keyboard } from "lucide-react";

interface StdinInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function StdinInput({ value, onChange }: StdinInputProps) {
  const [expanded, setExpanded] = useState(true);
  const lineCount = value ? value.split("\n").filter(Boolean).length : 0;

  return (
    <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-primary" /> : <ChevronRight className="w-3.5 h-3.5 text-primary" />}
        <Keyboard className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground tracking-wide uppercase">
          Standard Input (stdin)
        </span>
        {lineCount > 0 && (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-mono">
            {lineCount} line{lineCount !== 1 ? "s" : ""}
          </span>
        )}
      </button>
      {expanded && (
        <div className="p-2">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={"Enter input values here (one per line).\nEach line feeds one input() call.\n\nExample:\nAlice\n25\nHello World"}
            rows={4}
            spellCheck={false}
            className="w-full resize-y bg-editor-bg text-foreground font-mono text-sm leading-6 p-3 rounded-lg border border-border/50 outline-none
              focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all
              placeholder:text-muted-foreground/40 caret-primary min-h-[80px]"
          />
          <p className="text-[10px] text-muted-foreground mt-1 px-1">
            💡 Each line = one <code className="text-primary">input()</code> call. Add lines before running.
          </p>
        </div>
      )}
    </div>
  );
}
