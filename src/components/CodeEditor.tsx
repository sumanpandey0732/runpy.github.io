import { useRef, useCallback, useState, useEffect } from "react";
import type { RunStatus } from "@/hooks/use-pyodide";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  status: RunStatus;
  language?: "python" | "javascript";
}

const PYTHON_SUGGESTIONS = [
  "print()", "def ", "for ", "while ", "if ", "elif ", "else:", "import ", "from ", "class ",
  "return ", "try:", "except ", "with ", "as ", "lambda ", "range()", "len()", "input()",
  "list()", "dict()", "set()", "tuple()", "str()", "int()", "float()", "True", "False", "None",
];

const JS_SUGGESTIONS = [
  "console.log()", "function ", "const ", "let ", "var ", "if ", "else ", "for ", "while ",
  "return ", "class ", "import ", "export ", "async ", "await ", "try ", "catch ", "throw ",
  "new ", "this", "true", "false", "null", "undefined", "Array", "Object", "Promise",
  "setTimeout()", "setInterval()", "fetch()",
];

export function CodeEditor({ code, onChange, status, language = "python" }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggIdx, setSelectedSuggIdx] = useState(0);

  const lineCount = code.split("\n").length;
  const pool = language === "python" ? PYTHON_SUGGESTIONS : JS_SUGGESTIONS;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (suggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedSuggIdx((i) => Math.min(i + 1, suggestions.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedSuggIdx((i) => Math.max(i - 1, 0));
          return;
        }
        if (e.key === "Tab" || e.key === "Enter") {
          if (suggestions[selectedSuggIdx]) {
            e.preventDefault();
            const ta = e.currentTarget;
            const pos = ta.selectionStart;
            const before = code.substring(0, pos);
            const after = code.substring(pos);
            const lastWord = before.match(/[\w.]*$/)?.[0] || "";
            const completion = suggestions[selectedSuggIdx].substring(lastWord.length);
            const newCode = before + completion + after;
            onChange(newCode);
            setSuggestions([]);
            requestAnimationFrame(() => {
              ta.selectionStart = ta.selectionEnd = pos + completion.length;
            });
            return;
          }
        }
        if (e.key === "Escape") {
          setSuggestions([]);
          return;
        }
      }

      if (e.key === "Tab" && suggestions.length === 0) {
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
    [code, onChange, suggestions, selectedSuggIdx]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      onChange(val);

      const pos = e.target.selectionStart;
      const before = val.substring(0, pos);
      const word = before.match(/[\w.]+$/)?.[0] || "";

      if (word.length >= 2) {
        const matches = pool.filter((s) => s.toLowerCase().startsWith(word.toLowerCase())).slice(0, 5);
        setSuggestions(matches);
        setSelectedSuggIdx(0);
      } else {
        setSuggestions([]);
      }
    },
    [onChange, pool]
  );

  const updateCursor = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const lines = code.substring(0, pos).split("\n");
    setCursorInfo({ line: lines.length, col: lines[lines.length - 1].length + 1 });
  }, [code]);

  useEffect(() => { updateCursor(); }, [code, updateCursor]);

  const statusLabel = {
    idle: "Ready", loading: "Loading...", running: "Running...", error: "Error", success: "Done",
  }[status];

  const statusColor = {
    idle: "text-muted-foreground", loading: "text-console-info", running: "text-primary",
    error: "text-console-error", success: "text-console-success",
  }[status];

  const fileName = language === "python" ? "main.py" : "main.js";
  const langLabel = language === "python" ? "Python 3.x (Pyodide)" : "JavaScript (V8)";

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-border bg-card shadow-[var(--shadow-card)] relative">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-destructive/60" />
            <span className="w-3 h-3 rounded-full bg-accent/40" />
            <span className="w-3 h-3 rounded-full bg-primary/40" />
          </div>
          <span className="text-xs text-muted-foreground font-mono ml-2">{fileName}</span>
        </div>
        <span className="text-xs text-muted-foreground">{langLabel}</span>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line numbers */}
        <div
          className="flex flex-col items-end py-3 px-2 bg-editor-gutter text-editor-gutter-fg font-mono text-xs leading-6 select-none overflow-hidden min-w-[3rem]"
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className={cursorInfo.line === i + 1 ? "text-primary" : ""}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onKeyUp={updateCursor}
          onClick={() => { updateCursor(); setSuggestions([]); }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="flex-1 resize-none bg-editor-bg text-foreground font-mono text-sm leading-6 p-3 outline-none
            caret-primary placeholder:text-muted-foreground/40"
          placeholder={language === "python" ? "# Write your Python code here..." : "// Write your JavaScript code here..."}
          aria-label={`${language} code editor`}
        />

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute z-50 top-12 left-16 glass rounded-lg border border-border shadow-[var(--shadow-elevated)] overflow-hidden min-w-[180px] animate-fade-in">
            {suggestions.map((s, i) => (
              <button
                key={s}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSelectedSuggIdx(i);
                  // apply
                  const ta = textareaRef.current;
                  if (!ta) return;
                  const pos = ta.selectionStart;
                  const before = code.substring(0, pos);
                  const after = code.substring(pos);
                  const lastWord = before.match(/[\w.]*$/)?.[0] || "";
                  const completion = s.substring(lastWord.length);
                  onChange(before + completion + after);
                  setSuggestions([]);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors
                  ${i === selectedSuggIdx ? "bg-primary/20 text-primary" : "text-foreground hover:bg-secondary/60"}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-secondary/20 text-xs">
        <span className={`font-medium ${statusColor}`}>
          {status === "running" && <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse-glow mr-1.5" />}
          {statusLabel}
        </span>
        <span className="text-muted-foreground font-mono">Ln {cursorInfo.line}, Col {cursorInfo.col}</span>
      </div>
    </div>
  );
}
