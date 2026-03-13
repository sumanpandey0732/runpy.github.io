import { useRef, useCallback, useState, useEffect } from "react";
import type { RunStatus } from "@/hooks/use-pyodide";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  status: RunStatus;
  language?: "python" | "javascript";
}

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
  "from collections import", "from typing import", "from dataclasses import dataclass",
  "list comprehension: [x for x in ]", "dict comprehension: {k: v for k, v in }",
  "lambda x: x", "f\"{}\"",
];

const PYTHON_SUGGESTIONS = [
  ...PYTHON_KEYWORDS.map((k) => `${k} `),
  ...PYTHON_BUILTINS,
  ...PYTHON_STR_METHODS,
  ...PYTHON_LIST_METHODS,
  ...PYTHON_DICT_METHODS,
  ...PYTHON_SNIPPETS,
];

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

const OPENING_PAIRS: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  "\"": "\"",
  "'": "'",
  "`": "`",
};

const CLOSING_CHARS = new Set(Object.values(OPENING_PAIRS));
const MIRROR_STYLES = [
  "box-sizing", "width", "font-family", "font-size", "font-weight", "font-style",
  "letter-spacing", "line-height", "text-transform", "text-indent", "tab-size",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
  "white-space", "word-break",
] as const;

const getToken = (source: string) => source.match(/[\w.]+$/)?.[0] ?? "";

const scoreSuggestion = (suggestion: string, query: string) => {
  if (!query) return suggestion.startsWith(".") ? 0 : 1;
  const s = suggestion.toLowerCase();
  const q = query.toLowerCase();

  if (s.startsWith(q)) return 0;
  if (s.includes(`.${q}`)) return 1;
  if (s.includes(q)) return 2;

  return 99;
};

export function CodeEditor({ code, onChange, status, language = "python" }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorAreaRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggIdx, setSelectedSuggIdx] = useState(0);
  const [suggestionPos, setSuggestionPos] = useState({ top: 48, left: 72 });

  const lineCount = code.split("\n").length;
  const pool = language === "python" ? PYTHON_SUGGESTIONS : JS_SUGGESTIONS;

  useEffect(() => {
    if (!suggestionsRef.current || suggestions.length === 0) return;
    const selected = suggestionsRef.current.children[selectedSuggIdx] as HTMLElement | undefined;
    selected?.scrollIntoView({ block: "nearest" });
  }, [selectedSuggIdx, suggestions.length]);

  const positionSuggestions = useCallback((ta: HTMLTextAreaElement, caretPos: number, count: number) => {
    const area = editorAreaRef.current;
    if (!area) return;

    const computed = window.getComputedStyle(ta);
    const mirror = document.createElement("div");
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordBreak = "break-word";
    mirror.style.overflow = "hidden";

    MIRROR_STYLES.forEach((prop) => {
      mirror.style.setProperty(prop, computed.getPropertyValue(prop));
    });

    mirror.style.width = `${ta.clientWidth}px`;
    mirror.textContent = ta.value.slice(0, caretPos);

    const marker = document.createElement("span");
    marker.textContent = ta.value.slice(caretPos) || " ";
    mirror.appendChild(marker);
    document.body.appendChild(mirror);

    const areaRect = area.getBoundingClientRect();
    const taRect = ta.getBoundingClientRect();
    const lineHeight = Number.parseFloat(computed.lineHeight) || 24;
    const dropdownHeight = Math.min(220, count * 30 + 16);

    const rawLeft = taRect.left - areaRect.left + marker.offsetLeft - ta.scrollLeft;
    const rawTop = taRect.top - areaRect.top + marker.offsetTop - ta.scrollTop + lineHeight + 4;

    const left = Math.min(Math.max(8, rawLeft), Math.max(8, areaRect.width - 264));
    const top = rawTop + dropdownHeight > areaRect.height - 8
      ? Math.max(8, rawTop - dropdownHeight - lineHeight)
      : Math.max(8, rawTop);

    setSuggestionPos({ top, left });
    document.body.removeChild(mirror);
  }, []);

  const buildSuggestions = useCallback((value: string, cursorPos: number) => {
    const before = value.slice(0, cursorPos);
    const token = getToken(before);
    if (!token) return [];

    const memberMode = token.includes(".");
    const query = memberMode ? (token.split(".").pop() ?? "") : token;
    const sourcePool = memberMode ? pool.filter((s) => s.startsWith(".")) : pool;

    return sourcePool
      .map((s) => ({ s, rank: scoreSuggestion(s, query) }))
      .filter((item) => item.rank < 99 && item.s.toLowerCase() !== token.toLowerCase())
      .sort((a, b) => a.rank - b.rank || a.s.length - b.s.length)
      .map((item) => item.s)
      .filter((item, idx, arr) => arr.indexOf(item) === idx)
      .slice(0, 12);
  }, [pool]);

  const applySuggestion = useCallback((suggestion: string) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const pos = ta.selectionStart;
    const before = code.slice(0, pos);
    const after = code.slice(pos);
    const token = getToken(before);

    if (!token) return;

    const tokenStart = pos - token.length;
    let replaceStart = tokenStart;

    if (suggestion.startsWith(".") && token.includes(".")) {
      replaceStart = tokenStart + token.lastIndexOf(".");
    }

    const nextCode = code.slice(0, replaceStart) + suggestion + after;
    onChange(nextCode);
    setSuggestions([]);

    requestAnimationFrame(() => {
      const nextPos = replaceStart + suggestion.length;
      ta.selectionStart = ta.selectionEnd = nextPos;
      ta.focus();
    });
  }, [code, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;

    if ((e.ctrlKey || e.metaKey) && e.key === " ") {
      e.preventDefault();
      const next = buildSuggestions(code, ta.selectionStart);
      setSuggestions(next);
      setSelectedSuggIdx(0);
      if (next.length > 0) positionSuggestions(ta, ta.selectionStart, next.length);
      return;
    }

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
        e.preventDefault();
        const choice = suggestions[selectedSuggIdx];
        if (choice) applySuggestion(choice);
        return;
      }
      if (e.key === "Escape") {
        setSuggestions([]);
        return;
      }
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const nextCode = code.slice(0, start) + "    " + code.slice(end);
      onChange(nextCode);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
      return;
    }

    if (e.key === "Backspace" && ta.selectionStart === ta.selectionEnd) {
      const pos = ta.selectionStart;
      const prev = code[pos - 1];
      const next = code[pos];
      if (prev && OPENING_PAIRS[prev] === next) {
        e.preventDefault();
        onChange(code.slice(0, pos - 1) + code.slice(pos + 1));
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = pos - 1;
        });
        return;
      }
    }

    if (CLOSING_CHARS.has(e.key) && ta.selectionStart === ta.selectionEnd) {
      const pos = ta.selectionStart;
      if (code[pos] === e.key) {
        e.preventDefault();
        ta.selectionStart = ta.selectionEnd = pos + 1;
      }
      return;
    }

    if (OPENING_PAIRS[e.key] && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = code.slice(start, end);

      e.preventDefault();
      if (selected) {
        onChange(code.slice(0, start) + e.key + selected + OPENING_PAIRS[e.key] + code.slice(end));
        requestAnimationFrame(() => {
          ta.selectionStart = start + 1;
          ta.selectionEnd = end + 1;
        });
      } else {
        onChange(code.slice(0, start) + e.key + OPENING_PAIRS[e.key] + code.slice(end));
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 1;
        });
      }
    }
  }, [applySuggestion, buildSuggestions, code, onChange, positionSuggestions, selectedSuggIdx, suggestions]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;

    onChange(val);

    const next = buildSuggestions(val, pos);
    setSuggestions(next);
    setSelectedSuggIdx(0);

    if (next.length > 0) {
      positionSuggestions(e.target, pos, next.length);
    }
  }, [buildSuggestions, onChange, positionSuggestions]);

  const updateCursor = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    const pos = ta.selectionStart;
    const lines = code.slice(0, pos).split("\n");
    setCursorInfo({ line: lines.length, col: lines[lines.length - 1].length + 1 });

    if (suggestions.length > 0) {
      positionSuggestions(ta, pos, suggestions.length);
    }
  }, [code, positionSuggestions, suggestions.length]);

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

  const fileName = language === "python" ? "main.py" : "main.js";
  const langLabel = language === "python" ? "Python 3.x (Pyodide)" : "JavaScript (V8)";

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-border bg-card shadow-[var(--shadow-card)] relative card-3d">
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

      <div ref={editorAreaRef} className="flex-1 flex overflow-hidden relative">
        <div
          className="flex flex-col items-end py-3 px-2 bg-editor-gutter text-editor-gutter-fg font-mono text-xs leading-6 select-none overflow-hidden min-w-[2.5rem] sm:min-w-[3rem]"
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className={cursorInfo.line === i + 1 ? "text-primary" : ""}>{i + 1}</div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onKeyUp={updateCursor}
          onScroll={updateCursor}
          onClick={updateCursor}
          onBlur={() => setSuggestions([])}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="flex-1 resize-none bg-editor-bg text-foreground font-mono text-sm leading-6 p-3 outline-none caret-primary placeholder:text-muted-foreground/40"
          placeholder={language === "python" ? "# Write your Python code here..." : "// Write your JavaScript code here..."}
          aria-label={`${language} code editor`}
        />

        {suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 glass rounded-lg border border-border shadow-[var(--shadow-elevated)] overflow-hidden overflow-y-auto max-h-[220px] min-w-[240px] animate-fade-in"
            style={{ top: suggestionPos.top, left: suggestionPos.left }}
          >
            {suggestions.map((s, i) => (
              <button
                key={`${s}-${i}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  applySuggestion(s);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors flex items-center gap-2 ${
                  i === selectedSuggIdx ? "bg-primary/20 text-primary" : "text-foreground hover:bg-secondary/60"
                }`}
              >
                <span className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold bg-primary/10 text-primary shrink-0">
                  {s.startsWith(".") ? "M" : s.endsWith("()") ? "F" : s.endsWith(" ") ? "K" : "S"}
                </span>
                <span className="truncate">{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

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
