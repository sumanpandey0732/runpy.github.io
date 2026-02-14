import { useRef, useCallback, useState, useEffect } from "react";
import type { RunStatus } from "@/hooks/use-pyodide";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  status: RunStatus;
}

export function CodeEditor({ code, onChange, status }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });

  const lineCount = code.split("\n").length;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newCode = code.substring(0, start) + "    " + code.substring(end);
        onChange(newCode);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 4;
        });
      }
    },
    [code, onChange]
  );

  const updateCursor = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const lines = code.substring(0, pos).split("\n");
    setCursorInfo({ line: lines.length, col: lines[lines.length - 1].length + 1 });
  }, [code]);

  useEffect(() => {
    updateCursor();
  }, [code, updateCursor]);

  const statusLabel = {
    idle: "Ready",
    loading: "Loading...",
    running: "Running...",
    error: "Error",
    success: "Done",
  }[status];

  const statusColor = {
    idle: "text-muted-foreground",
    loading: "text-console-info",
    running: "text-primary",
    error: "text-console-error",
    success: "text-console-success",
  }[status];

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-border bg-card shadow-[var(--shadow-card)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-destructive/60" />
            <span className="w-3 h-3 rounded-full bg-accent/40" />
            <span className="w-3 h-3 rounded-full bg-primary/40" />
          </div>
          <span className="text-xs text-muted-foreground font-mono ml-2">main.py</span>
        </div>
        <span className="text-xs text-muted-foreground">Python 3.x (Pyodide)</span>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line numbers */}
        <div
          className="flex flex-col items-end py-3 px-2 bg-editor-gutter text-editor-gutter-fg font-mono text-xs leading-6 select-none overflow-hidden min-w-[3rem]"
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className={cursorInfo.line === i + 1 ? "text-primary" : ""}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={updateCursor}
          onClick={updateCursor}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="flex-1 resize-none bg-editor-bg text-foreground font-mono text-sm leading-6 p-3 outline-none
            caret-primary placeholder:text-muted-foreground/40"
          placeholder="# Write your Python code here..."
          aria-label="Python code editor"
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-secondary/20 text-xs">
        <span className={`font-medium ${statusColor}`}>
          {status === "running" && <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse-glow mr-1.5" />}
          {statusLabel}
        </span>
        <span className="text-muted-foreground font-mono">
          Ln {cursorInfo.line}, Col {cursorInfo.col}
        </span>
      </div>
    </div>
  );
}
