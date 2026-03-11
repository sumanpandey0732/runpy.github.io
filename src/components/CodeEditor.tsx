import { useRef, useCallback, useState, useEffect } from "react";
import type { RunStatus } from "@/hooks/use-pyodide";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  status: RunStatus;
  language?: "python" | "javascript";
}

// ── Comprehensive Python suggestions ──
const PYTHON_KEYWORDS = [
  "and", "as", "assert", "async", "await", "break", "class", "continue",
  "def", "del", "elif", "else", "except", "finally", "for", "from",
  "global", "if", "import", "in", "is", "lambda", "nonlocal", "not",
  "or", "pass", "raise", "return", "try", "while", "with", "yield",
];

const PYTHON_BUILTINS = [
  "print()", "input()", "len()", "range()", "type()", "int()", "float()",
  "str()", "bool()", "list()", "dict()", "set()", "tuple()", "abs()",
  "max()", "min()", "sum()", "sorted()", "reversed()", "enumerate()",
  "zip()", "map()", "filter()", "any()", "all()", "isinstance()",
  "issubclass()", "hasattr()", "getattr()", "setattr()", "delattr()",
  "open()", "round()", "pow()", "divmod()", "hex()", "oct()", "bin()",
  "ord()", "chr()", "format()", "repr()", "id()", "hash()", "dir()",
  "vars()", "globals()", "locals()", "exec()", "eval()", "compile()",
  "super()", "property()", "staticmethod()", "classmethod()",
  "True", "False", "None",
];

const PYTHON_STR_METHODS = [
  ".strip()", ".split()", ".join()", ".replace()", ".find()", ".index()",
  ".count()", ".startswith()", ".endswith()", ".upper()", ".lower()",
  ".title()", ".capitalize()", ".isdigit()", ".isalpha()", ".isalnum()",
  ".format()", ".encode()", ".decode()", ".center()", ".ljust()", ".rjust()",
  ".lstrip()", ".rstrip()", ".partition()", ".zfill()",
];

const PYTHON_LIST_METHODS = [
  ".append()", ".extend()", ".insert()", ".remove()", ".pop()", ".clear()",
  ".index()", ".count()", ".sort()", ".reverse()", ".copy()",
];

const PYTHON_DICT_METHODS = [
  ".keys()", ".values()", ".items()", ".get()", ".setdefault()",
  ".update()", ".pop()", ".popitem()", ".clear()", ".copy()",
];

const PYTHON_SNIPPETS = [
  "def function_name():", "class ClassName:", "if __name__ == '__main__':",
  "for i in range():", "while True:", "try:\n    pass\nexcept Exception as e:",
  "with open() as f:", "import os", "import sys", "import json",
  "import math", "import random", "import datetime", "import re",
  "from collections import", "from typing import",
  "list comprehension: [x for x in ]", "dict comprehension: {k: v for k, v in }",
  "lambda x: x", "f\"{}\"",
];

const PYTHON_SUGGESTIONS = [
  ...PYTHON_KEYWORDS.map(k => k + " "),
  ...PYTHON_BUILTINS,
  ...PYTHON_STR_METHODS,
  ...PYTHON_LIST_METHODS,
  ...PYTHON_DICT_METHODS,
  ...PYTHON_SNIPPETS,
];

// ── Comprehensive JavaScript suggestions ──
const JS_KEYWORDS = [
  "const ", "let ", "var ", "function ", "class ", "if ", "else ", "else if ",
  "for ", "while ", "do ", "switch ", "case ", "break", "continue", "return ",
  "import ", "export ", "default ", "async ", "await ", "try ", "catch ",
  "finally ", "throw ", "new ", "delete ", "typeof ", "instanceof ",
  "yield ", "of ", "in ",
];

const JS_BUILTINS = [
  "console.log()", "console.error()", "console.warn()", "console.table()",
  "console.time()", "console.timeEnd()", "console.group()", "console.groupEnd()",
  "setTimeout()", "setInterval()", "clearTimeout()", "clearInterval()",
  "fetch()", "JSON.stringify()", "JSON.parse()",
  "parseInt()", "parseFloat()", "isNaN()", "isFinite()",
  "encodeURIComponent()", "decodeURIComponent()",
  "Math.floor()", "Math.ceil()", "Math.round()", "Math.random()",
  "Math.max()", "Math.min()", "Math.abs()", "Math.pow()", "Math.sqrt()",
  "Date.now()", "new Date()", "new Map()", "new Set()", "new WeakMap()",
  "new Promise()", "Promise.all()", "Promise.race()", "Promise.resolve()",
  "Object.keys()", "Object.values()", "Object.entries()", "Object.assign()",
  "Object.freeze()", "Object.create()",
  "Array.from()", "Array.isArray()", "Array.of()",
  "true", "false", "null", "undefined", "NaN", "Infinity",
];

const JS_ARRAY_METHODS = [
  ".push()", ".pop()", ".shift()", ".unshift()", ".splice()", ".slice()",
  ".concat()", ".join()", ".reverse()", ".sort()", ".indexOf()", ".lastIndexOf()",
  ".includes()", ".find()", ".findIndex()", ".filter()", ".map()", ".reduce()",
  ".reduceRight()", ".forEach()", ".every()", ".some()", ".flat()", ".flatMap()",
  ".fill()", ".copyWithin()", ".entries()", ".keys()", ".values()", ".at()",
];

const JS_STRING_METHODS = [
  ".charAt()", ".charCodeAt()", ".concat()", ".includes()", ".indexOf()",
  ".lastIndexOf()", ".match()", ".matchAll()", ".replace()", ".replaceAll()",
  ".search()", ".slice()", ".split()", ".startsWith()", ".endsWith()",
  ".substring()", ".toLowerCase()", ".toUpperCase()", ".trim()", ".trimStart()",
  ".trimEnd()", ".padStart()", ".padEnd()", ".repeat()", ".at()",
];

const JS_SNIPPETS = [
  "const fn = () => {}", "function name() {}", "class Name {}",
  "async function name() {}", "for (let i = 0; i < ; i++) {}",
  "for (const item of ) {}", "for (const key in ) {}",
  "try {\n} catch (e) {\n}", "switch () {\n  case :\n    break;\n  default:\n}",
  "new Promise((resolve, reject) => {})",
  "const result = await fetch()",
  ".then().catch()", "addEventListener()", "removeEventListener()",
  "document.querySelector()", "document.getElementById()",
  "export default", "export const", "import { } from ''",
  "Array.from({ length: }, (_, i) => i)",
  "Object.entries().map(([key, value]) => )",
  "?.optional?.chaining", "??nullish??coalescing",
  "template literal: `${}`",
];

const JS_SUGGESTIONS = [
  ...JS_KEYWORDS,
  ...JS_BUILTINS,
  ...JS_ARRAY_METHODS,
  ...JS_STRING_METHODS,
  ...JS_SNIPPETS,
];

export function CodeEditor({ code, onChange, status, language = "python" }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggIdx, setSelectedSuggIdx] = useState(0);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const lineCount = code.split("\n").length;
  const pool = language === "python" ? PYTHON_SUGGESTIONS : JS_SUGGESTIONS;

  // Auto-scroll selected suggestion into view
  useEffect(() => {
    if (suggestionsRef.current && suggestions.length > 0) {
      const selected = suggestionsRef.current.children[selectedSuggIdx] as HTMLElement;
      selected?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedSuggIdx, suggestions.length]);

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

      // Auto-close brackets and quotes
      const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}", "'": "'", '"': '"', "`": "`" };
      if (pairs[e.key]) {
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        if (start !== end) return; // don't auto-close on selection
        e.preventDefault();
        const before = code.substring(0, start);
        const after = code.substring(start);
        const newCode = before + e.key + pairs[e.key] + after;
        onChange(newCode);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 1;
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

      if (word.length >= 1) {
        const matches = pool
          .filter((s) => s.toLowerCase().startsWith(word.toLowerCase()) && s.toLowerCase() !== word.toLowerCase())
          .slice(0, 8);
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
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-border bg-card shadow-[var(--shadow-card)] relative card-3d">
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
        <span className="text-xs text-muted-foreground hidden sm:inline">{langLabel}</span>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line numbers */}
        <div
          className="flex flex-col items-end py-3 px-2 bg-editor-gutter text-editor-gutter-fg font-mono text-xs leading-6 select-none overflow-hidden min-w-[2.5rem] sm:min-w-[3rem]"
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
          <div
            ref={suggestionsRef}
            className="absolute z-50 top-12 left-16 glass rounded-lg border border-border shadow-[var(--shadow-elevated)] overflow-hidden overflow-y-auto max-h-[200px] min-w-[220px] animate-fade-in"
          >
            {suggestions.map((s, i) => (
              <button
                key={s}
                onMouseDown={(e) => {
                  e.preventDefault();
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
                className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors flex items-center gap-2
                  ${i === selectedSuggIdx ? "bg-primary/20 text-primary" : "text-foreground hover:bg-secondary/60"}`}
              >
                <span className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold bg-primary/10 text-primary shrink-0">
                  {s.startsWith(".") ? "M" : s.endsWith("()") ? "F" : s.endsWith(" ") ? "K" : "V"}
                </span>
                <span className="truncate">{s}</span>
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
