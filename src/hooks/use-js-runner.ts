import { useCallback, useState } from "react";
import type { ConsoleEntry } from "@/hooks/use-pyodide";

export type JsRunStatus = "idle" | "running" | "error" | "success";

export function useJsRunner() {
  const [status, setStatus] = useState<JsRunStatus>("idle");
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);

  const addEntry = useCallback((type: ConsoleEntry["type"], text: string) => {
    setEntries((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, text, timestamp: Date.now() },
    ]);
  }, []);

  const run = useCallback(
    (code: string) => {
      if (!code.trim()) {
        addEntry("info", "⚠️ No code to run.");
        return;
      }
      setEntries([]);
      setStatus("running");

      const origLog = console.log;
      const origErr = console.error;
      const origWarn = console.warn;
      const captured: ConsoleEntry[] = [];

      const capture = (type: ConsoleEntry["type"]) => (...args: unknown[]) => {
        const text = args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ");
        captured.push({ id: crypto.randomUUID(), type, text, timestamp: Date.now() });
      };

      console.log = capture("stdout") as typeof console.log;
      console.error = capture("stderr") as typeof console.error;
      console.warn = capture("stderr") as typeof console.warn;

      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function(code);
        fn();
        setStatus("success");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        captured.push({ id: crypto.randomUUID(), type: "stderr", text: msg, timestamp: Date.now() });
        setStatus("error");
      } finally {
        console.log = origLog;
        console.error = origErr;
        console.warn = origWarn;
        setEntries(captured);
      }
    },
    [addEntry]
  );

  const clearConsole = useCallback(() => setEntries([]), []);

  return { run, clearConsole, status, entries };
}
