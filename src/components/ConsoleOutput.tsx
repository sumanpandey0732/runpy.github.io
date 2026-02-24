// src/components/ConsoleOutput.tsx
import { useRef, useEffect, useCallback } from "react";
import { Copy, Trash2, Terminal } from "lucide-react";
import type { ConsoleEntry } from "@/hooks/use-pyodide";

interface ConsoleOutputProps {
  entries: ConsoleEntry[];
  onClear: () => void;
  executionTime: number | null;
  sendInput: (value: string) => void;
}

export function ConsoleOutput({ entries, onClear, sendInput }: ConsoleOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // scroll to bottom whenever entries change
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // focus the inline editable spot (if present)
    // small timeout so DOM update completes
    setTimeout(() => {
      if (editableRef.current) {
        editableRef.current.focus();
        // place caret at end
        const range = document.createRange();
        range.selectNodeContents(editableRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, 20);
  }, [entries.length]);

  const copyAll = useCallback(() => {
    const text = entries.map((e) => e.text).join("");
    navigator.clipboard.writeText(text);
  }, [entries]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = editableRef.current?.innerText ?? "";
      // send even if empty (user may intentionally send empty line)
      sendInput(value);
      // clear editable text and keep focus
      if (editableRef.current) {
        editableRef.current.innerText = "";
        // keep caret at end
        const range = document.createRange();
        range.selectNodeContents(editableRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
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

      <div
        className="flex-1 overflow-y-auto p-3 bg-console-bg font-mono text-sm space-y-0.5"
        onKeyDown={handleKeyDown}
      >
        {entries.length === 0 && (
          <p className="text-muted-foreground/50 text-xs italic">Output will appear here...</p>
        )}

        {entries.map((entry, idx) => {
          const isLast = idx === entries.length - 1;
          return (
            <div
              key={entry.id}
              className={`animate-fade-in leading-relaxed ${getEntryClass(entry.type)}`}
            >
              {/* entry.text already contains its own newline if needed */}
              <span>{entry.text}</span>
              {/* show editable inline spot only after the last stdout entry */}
              {isLast && entry.type === "stdout" && (
                <span
                  ref={editableRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="inline-block w-auto outline-none"
                  style={{ whiteSpace: "pre-wrap" }}
                />
              )}
            </div>
          );
        })}
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