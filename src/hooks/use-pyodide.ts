// src/hooks/use-pyodide.ts
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

// Input handling: queue + pending resolvers so stdin can await until input arrives.
let inputQueue = [];
let pendingResolvers = [];

async function loadPyodideRuntime() {
  if (pyodide) return pyodide;
  if (pyodideLoading) return null;
  pyodideLoading = true;

  try {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");
    pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/" });

    // stdout / stderr -> post to main thread
    pyodide.setStdout({
      batched: (text) => self.postMessage({ type: "stdout", text })
    });
    pyodide.setStderr({
      batched: (text) => self.postMessage({ type: "stderr", text })
    });

    // async stdin: wait until an input is pushed from main thread
    pyodide.setStdin({
      stdin: async () => {
        if (inputQueue.length > 0) {
          return inputQueue.shift();
        }
        // wait until main thread supplies input
        return await new Promise((resolve) => {
          pendingResolvers.push(resolve);
        });
      }
    });

    self.postMessage({ type: "ready", version: pyodide.version });
    return pyodide;
  } catch (e) {
    self.postMessage({ type: "error", message: "Failed to load Python runtime: " + (e && e.message ? e.message : e) });
    pyodideLoading = false;
    return null;
  }
}

self.onmessage = async function(e) {
  const { type, code, runId, value } = e.data;

  if (type === "load") {
    self.postMessage({ type: "loading" });
    await loadPyodideRuntime();
    return;
  }

  // Input from main thread: resolve pending or queue it
  if (type === "input") {
    const v = String(value) + "\\n"; // ensure newline
    if (pendingResolvers.length > 0) {
      const r = pendingResolvers.shift();
      try { r(v); } catch(e) { /* ignore */ }
    } else {
      inputQueue.push(v);
    }
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
      // ensure a fresh small env for captures if needed
      await pyodide.runPythonAsync(code);
      const elapsed = performance.now() - startTime;
      self.postMessage({ type: "result", success: true, runId, elapsed });
    } catch (err) {
      const elapsed = performance.now() - startTime;
      // err may be an Error or string
      const message = err && err.message ? err.message : String(err);
      self.postMessage({ type: "stderr", text: message });
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
          break;
        case "error":
          setStatus("error");
          addEntry("stderr", msg.message);
          break;
        default:
          // ignore unknown
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

      setEntries([]);
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

  // sendInput: post to worker AND echo into console so user sees typed text
  const sendInput = useCallback((value: string) => {
    // echo user input into console (like terminal) so it looks real
    addEntry("stdout", value + "\\n");
    workerRef.current?.postMessage({ type: "input", value });
  }, [addEntry]);

  return {
    run,
    stop,
    clearConsole,
    preload,
    sendInput,
    status,
    entries,
    executionTime,
    pyodideVersion,
  };
}