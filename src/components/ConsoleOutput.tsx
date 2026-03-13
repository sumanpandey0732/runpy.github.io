import { useRef, useEffect, useCallback, useState } from "react";
import { Copy, Trash2, Terminal } from "lucide-react";
import type { ConsoleEntry } from "@/hooks/use-pyodide";

interface ConsoleOutputProps {
  entries: ConsoleEntry[];
  onClear: () => void;
  executionTime: number | null;
  sendInput: (value: string) => void;
  waitingForInput: boolean;
}

export function ConsoleOutput({ entries, onClear, sendInput, waitingForInput }: ConsoleOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  useEffect(() => {
    if (waitingForInput) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [waitingForInput]);

  const copyAll = useCallback(() => {
    const text = entries.map((e) => e.text).join("");
    navigator.clipboard.writeText(text);
  }, [entries]);

  const handleSubmit = () => {
    sendInput(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

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
            <span>{entry.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {waitingForInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-console-bg font-mono text-sm">
          <span className="text-primary font-bold select-none">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/50 caret-primary"
            placeholder="Type input and press Enter..."
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}
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
