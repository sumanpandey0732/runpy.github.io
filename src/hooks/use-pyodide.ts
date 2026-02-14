// Pyodide worker execution hook
import { useCallback, useRef, useState } from "react";

export interface ConsoleEntry {
  id: string;
  type: "stdout" | "stderr" | "info" | "result";
  text: string;
  timestamp: number;
}

export type RunStatus = "idle" | "loading" | "running" | "error" | "success";

const WORKER_CODE = `
let pyodide = null;
let pyodideLoading = false;

async function loadPyodideRuntime() {
  if (pyodide) return pyodide;
  if (pyodideLoading) return null;
  pyodideLoading = true;
  
  try {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
      stdout: (text) => self.postMessage({ type: "stdout", text }),
      stderr: (text) => self.postMessage({ type: "stderr", text }),
    });
    self.postMessage({ type: "ready", version: pyodide.version });
    return pyodide;
  } catch (e) {
    self.postMessage({ type: "error", message: "Failed to load Python runtime: " + e.message });
    pyodideLoading = false;
    return null;
  }
}

self.onmessage = async function(e) {
  const { type, code, runId } = e.data;
  
  if (type === "load") {
    self.postMessage({ type: "loading" });
    await loadPyodideRuntime();
    return;
  }
  
  if (type === "run") {
    if (!pyodide) {
      self.postMessage({ type: "loading" });
      const py = await loadPyodideRuntime();
      if (!py) return;
    }
    
    const startTime = performance.now();
    try {
      // Reset stdout capture
      pyodide.runPython(\`
import sys
import io
\`);
      
      await pyodide.runPythonAsync(code);
      const elapsed = performance.now() - startTime;
      self.postMessage({ type: "result", success: true, runId, elapsed });
    } catch (err) {
      const elapsed = performance.now() - startTime;
      self.postMessage({ type: "stderr", text: err.message });
      self.postMessage({ type: "result", success: false, runId, elapsed });
    }
  }
};
`;

export function usePyodide() {
  const workerRef = useRef<Worker | null>(null);
  const runIdRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [pyodideVersion, setPyodideVersion] = useState<string | null>(null);
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const addEntry = useCallback((type: ConsoleEntry["type"], text: string) => {
    const entry: ConsoleEntry = {
      id: crypto.randomUUID(),
      type,
      text,
      timestamp: Date.now(),
    };
    setEntries((prev) => [...prev, entry]);
  }, []);

  const createWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
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
          addEntry("info", `${msg.success ? "✅" : "❌"} Finished in ${msg.elapsed.toFixed(0)}ms`);
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

  const run = useCallback(
    (code: string, timeout = 15000) => {
      if (!code.trim()) {
        addEntry("info", "⚠️ No code to run.");
        return;
      }

      const worker = workerRef.current ?? createWorker();
      const runId = ++runIdRef.current;
      setStatus("running");
      setExecutionTime(null);

      worker.postMessage({ type: "run", code, runId });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        addEntry("stderr", `⏱ Execution timed out after ${timeout / 1000}s`);
        stop();
      }, timeout);
    },
    [createWorker, addEntry]
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

  return {
    run,
    stop,
    clearConsole,
    preload,
    status,
    entries,
    executionTime,
    pyodideVersion,
  };
}
