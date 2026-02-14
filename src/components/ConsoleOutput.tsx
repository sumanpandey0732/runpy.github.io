import { useRef, useEffect, useCallback } from "react";
import { Copy, Trash2, Terminal } from "lucide-react";
import type { ConsoleEntry } from "@/hooks/use-pyodide";

interface ConsoleOutputProps {
  entries: ConsoleEntry[];
  onClear: () => void;
  executionTime: number | null;
}

export function ConsoleOutput({ entries, onClear }: ConsoleOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  const copyAll = useCallback(() => {
    const text = entries.map((e) => e.text).join("\n");
    navigator.clipboard.writeText(text);
  }, [entries]);

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Console</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={copyAll} aria-label="Copy output"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClear} aria-label="Clear console"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 bg-console-bg font-mono text-sm space-y-0.5">
        {entries.length === 0 && (
          <p className="text-muted-foreground/50 text-xs italic">Output will appear here...</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className={`animate-fade-in leading-relaxed ${getEntryClass(entry.type)}`}>
            {entry.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function getEntryClass(type: ConsoleEntry["type"]): string {
  switch (type) {
    case "stdout": return "text-foreground";
    case "stderr": return "text-console-error";
    case "info": return "text-console-info";
    case "result": return "text-console-success";
    default: return "text-foreground";
  }
}
