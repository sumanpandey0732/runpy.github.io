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

// SharedArrayBuffer-based synchronous stdin
let sharedControl = null; // Int32Array(1) - 0=waiting, 1=data ready
let sharedData = null;    // Uint8Array for input string
let sabAvailable = false;

// Fallback queue for non-SAB environments
let inputQueue = [];
let sabFallbackMode = false;

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

    // Set up stdin based on whether SharedArrayBuffer is available
    if (sabAvailable && sharedControl && sharedData) {
      pyodide.setStdin({
        stdin: () => {
          // Signal main thread we need input
          self.postMessage({ type: "input_request" });
          // Reset control flag
          Atomics.store(sharedControl, 0, 0);
          // Block until main thread writes data and sets control to 1
          Atomics.wait(sharedControl, 0, 0);
          // Read the input string
          let len = 0;
          while (sharedData[len] !== 0 && len < 4000) len++;
          const decoder = new TextDecoder();
          return decoder.decode(sharedData.slice(0, len));
        }
      });
    } else {
      // Fallback mode: only supports pre-queued input (no blocking without SharedArrayBuffer)
      sabFallbackMode = true;
      pyodide.setStdin({
        stdin: () => {
          if (inputQueue.length > 0) {
            return inputQueue.shift();
          }
          self.postMessage({ type: "input_request" });
          // Prevent OSError in compatibility mode when no input is queued yet.
          // Returning escaped newline gives Python input() an empty string instead of crashing.
          return "\\n";
        }
      });
    }

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

  if (type === "init_sab") {
    try {
      sharedControl = new Int32Array(e.data.sab, 0, 1);
      sharedData = new Uint8Array(e.data.sab, 4);
      sabAvailable = true;
    } catch(err) {
      sabAvailable = false;
    }
    return;
  }

  if (type === "load") {
    self.postMessage({ type: "loading" });
    await loadPyodideRuntime();
    return;
  }

  // Input from main thread (fallback mode)
  if (type === "input") {
    const v = String(value) + "\\n";
    inputQueue.push(v);
    return;
  }

  if (type === "reset_input_queue") {
    inputQueue = [];
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
      await pyodide.runPythonAsync(code);
      const elapsed = performance.now() - startTime;
      self.postMessage({ type: "result", success: true, runId, elapsed });
    } catch (err) {
      const elapsed = performance.now() - startTime;
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
  const sabRef = useRef<SharedArrayBuffer | null>(null);
  const sabControlRef = useRef<Int32Array | null>(null);
  const sabDataRef = useRef<Uint8Array | null>(null);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [pyodideVersion, setPyodideVersion] = useState<string | null>(null);
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const sabAvailableRef = useRef(false);

  const addEntry = useCallback((type: ConsoleEntry["type"], text: string) => {
    const entry: ConsoleEntry = {
      id: crypto.randomUUID(),
      type,
      text,
      timestamp: Date.now(),
    };
    setEntries((prev) => [...prev, entry]);
  }, []);

  const initSharedBuffer = useCallback(() => {
    try {
      const sab = new SharedArrayBuffer(4 + 4096);
      sabRef.current = sab;
      sabControlRef.current = new Int32Array(sab, 0, 1);
      sabDataRef.current = new Uint8Array(sab, 4);
      sabAvailableRef.current = true;
      return sab;
    } catch {
      sabAvailableRef.current = false;
      return null;
    }
  }, []);

  const createWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    const blob = new Blob([WORKER_CODE], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    URL.revokeObjectURL(url);

    // Try to set up SharedArrayBuffer
    const sab = initSharedBuffer();
    if (sab) {
      worker.postMessage({ type: "init_sab", sab });
    } else {
      addEntry("info", "⚠️ Interactive stdin is running in compatibility mode on this browser.");
    }

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
        case "input_request":
          setWaitingForInput(true);
          break;
        case "result":
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setStatus(msg.success ? "success" : "error");
          setExecutionTime(msg.elapsed);
          setWaitingForInput(false);
          break;
        case "error":
          setStatus("error");
          addEntry("stderr", msg.message);
          break;
        default:
          break;
      }
    };

    worker.onerror = () => {
      setStatus("error");
      addEntry("stderr", "Worker crashed unexpectedly.");
    };

    workerRef.current = worker;
    return worker;
  }, [addEntry, initSharedBuffer]);

  const run = useCallback(
    (code: string, timeout = 30000) => {
      if (!code.trim()) {
        addEntry("info", "⚠️ No code to run.");
        return;
      }

      setEntries([]);
      const worker = workerRef.current ?? createWorker();
      const runId = ++runIdRef.current;
      setStatus("running");
      setExecutionTime(null);
      setWaitingForInput(false);

      worker.postMessage({ type: "reset_input_queue" });

      // Compatibility mode: pre-collect inputs when SharedArrayBuffer is unavailable.
      if (!sabAvailableRef.current && /\binput\s*\(/.test(code)) {
        const literalPrompts = [...code.matchAll(/input\((['"`])([^'"`]*)\1\)/g)].map((m) => m[2]);
        const expectedInputs = Math.min((code.match(/\binput\s*\(/g) || []).length, 8);
        addEntry("info", "📝 Compatibility input mode enabled for this browser.");

        for (let i = 0; i < expectedInputs; i++) {
          const label = literalPrompts[i]?.trim() || `Input ${i + 1}`;
          const value = window.prompt(label) ?? "";
          worker.postMessage({ type: "input", value });
        }
      }

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
    setWaitingForInput(false);
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

  // sendInput: write to SharedArrayBuffer if available, otherwise fallback to message
  const sendInput = useCallback((value: string) => {
    addEntry("stdout", value + "\n");

    if (sabAvailableRef.current && sabControlRef.current && sabDataRef.current) {
      // Write input to SharedArrayBuffer
      const encoded = new TextEncoder().encode(value + "\n");
      const maxBytes = sabDataRef.current.length - 1;
      sabDataRef.current.fill(0); // clear
      sabDataRef.current.set(encoded.slice(0, maxBytes));
      // Signal worker that data is ready
      Atomics.store(sabControlRef.current, 0, 1);
      Atomics.notify(sabControlRef.current, 0);
    } else {
      // Fallback: send via message
      workerRef.current?.postMessage({ type: "input", value });
    }

    setWaitingForInput(false);
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
    waitingForInput,
  };
}
