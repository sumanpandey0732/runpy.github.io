// src/hooks/use-pyodide.ts — Queue-based stdin (no SharedArrayBuffer needed)
import { useCallback, useRef, useState } from "react";

export interface ConsoleEntry {
  id: string;
  type: "stdout" | "stderr" | "info" | "result";
  text: string;
  timestamp: number;
}

export type RunStatus = "idle" | "loading" | "running" | "error" | "success";

/* Worker source built as an array of lines to avoid template-literal escaping bugs */
const WORKER_LINES = [
  'var pyodide = null;',
  'var pyodideLoading = false;',
  'var inputQueue = [];',
  '',
  'async function loadPyodideRuntime() {',
  '  if (pyodide) return pyodide;',
  '  if (pyodideLoading) return null;',
  '  pyodideLoading = true;',
  '  try {',
  '    importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");',
  '    pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/" });',
  '    pyodide.setStdout({ batched: function(t) { self.postMessage({ type: "stdout", text: t }); } });',
  '    pyodide.setStderr({ batched: function(t) { self.postMessage({ type: "stderr", text: t }); } });',
  '    pyodide.setStdin({',
  '      stdin: function() {',
  '        if (inputQueue.length > 0) return inputQueue.shift();',
  '        throw new Error("EOFError: no more input");',
  '      }',
  '    });',
  '    self.postMessage({ type: "ready", version: pyodide.version });',
  '    return pyodide;',
  '  } catch (e) {',
  '    self.postMessage({ type: "error", message: "Failed to load Python: " + (e && e.message ? e.message : e) });',
  '    pyodideLoading = false;',
  '    return null;',
  '  }',
  '}',
  '',
  'self.onmessage = async function(e) {',
  '  var d = e.data;',
  '  if (d.type === "load") { self.postMessage({ type: "loading" }); await loadPyodideRuntime(); return; }',
  '  if (d.type === "set_stdin") {',
  '    inputQueue = [];',
  '    var lines = d.lines || [];',
  '    for (var i = 0; i < lines.length; i++) inputQueue.push(lines[i] + "\\n");',
  '    return;',
  '  }',
  '  if (d.type === "run") {',
  '    if (!pyodide) { self.postMessage({ type: "loading" }); var py = await loadPyodideRuntime(); if (!py) return; }',
  '    var t0 = performance.now();',
  '    try {',
  '      await pyodide.runPythonAsync(d.code);',
  '      self.postMessage({ type: "result", success: true, runId: d.runId, elapsed: performance.now() - t0 });',
  '    } catch (err) {',
  '      var msg = err && err.message ? err.message : String(err);',
  '      if (msg.indexOf("EOFError") !== -1) {',
  '        self.postMessage({ type: "stderr", text: "EOFError: Not enough input lines. Add more lines in the stdin box and re-run." });',
  '      } else {',
  '        self.postMessage({ type: "stderr", text: msg });',
  '      }',
  '      self.postMessage({ type: "result", success: false, runId: d.runId, elapsed: performance.now() - t0 });',
  '    }',
  '  }',
  '};',
];

const WORKER_CODE = WORKER_LINES.join("\n");

export function usePyodide() {
  const workerRef = useRef<Worker | null>(null);
  const runIdRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [pyodideVersion, setPyodideVersion] = useState<string | null>(null);
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const addEntry = useCallback((type: ConsoleEntry["type"], text: string) => {
    setEntries((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, text, timestamp: Date.now() },
    ]);
  }, []);

  const createWorker = useCallback(() => {
    if (workerRef.current) workerRef.current.terminate();
    const blob = new Blob([WORKER_CODE], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    URL.revokeObjectURL(url);

    worker.onmessage = (e) => {
      const msg = e.data;
      switch (msg.type) {
        case "loading":
          setStatus("loading");
          addEntry("info", "⏳ Loading Python runtime...");
          break;
        case "ready":
          setPyodideVersion(msg.version);
          addEntry("info", `✅ Python runtime ready (Pyodide ${msg.version})`);
          break;
        case "stdout":
          addEntry("stdout", msg.text);
          break;
        case "stderr":
          addEntry("stderr", msg.text);
          break;
        case "result":
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setStatus(msg.success ? "success" : "error");
          setExecutionTime(msg.elapsed);
          break;
        case "error":
          setStatus("error");
          addEntry("stderr", msg.message);
          break;
      }
    };

    worker.onerror = () => {
      setStatus("error");
      addEntry("stderr", "Worker crashed unexpectedly.");
    };

    workerRef.current = worker;
    return worker;
  }, [addEntry]);

  /** Run code. stdinLines = one string per input() call. */
  const run = useCallback(
    (code: string, stdinLines: string[] = [], timeout = 30000) => {
      if (!code.trim()) {
        addEntry("info", "⚠️ No code to run.");
        return;
      }
      setEntries([]);
      setExecutionTime(null);
      const worker = workerRef.current ?? createWorker();
      const runId = ++runIdRef.current;
      setStatus("running");

      worker.postMessage({ type: "set_stdin", lines: stdinLines });
      worker.postMessage({ type: "run", code, runId });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        addEntry("stderr", `⏱ Execution timed out after ${timeout / 1000}s`);
        stop();
      }, timeout);
    },
    [createWorker, addEntry],
  );

  const stop = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setStatus("idle");
    addEntry("info", "🛑 Execution stopped.");
  }, [addEntry]);

  const clearConsole = useCallback(() => {
    setEntries([]);
    setExecutionTime(null);
  }, []);

  const preload = useCallback(() => {
    const worker = createWorker();
    worker.postMessage({ type: "load" });
  }, [createWorker]);

  return { run, stop, clearConsole, preload, status, entries, executionTime, pyodideVersion };
}
