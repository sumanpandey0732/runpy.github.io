import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type RunStatus = "idle" | "loading" | "running" | "error" | "success";

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  elapsed: number;
}

export function useCodeRunner() {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const run = useCallback(
    async (
      code: string,
      language: "python" | "javascript",
      stdin: string = ""
    ): Promise<ExecutionResult> => {
      if (!code.trim()) {
        return { stdout: "", stderr: "No code to run.", exitCode: 1, elapsed: 0 };
      }

      setStatus("running");
      setExecutionTime(null);
      const t0 = performance.now();

      try {
        const { data, error } = await supabase.functions.invoke("execute-code", {
          body: { code, language, stdin },
        });

        const elapsed = performance.now() - t0;
        setExecutionTime(elapsed);

        if (error) {
          setStatus("error");
          return { stdout: "", stderr: error.message || "Execution failed", exitCode: 1, elapsed };
        }

        if (data?.error) {
          setStatus("error");
          return { stdout: "", stderr: data.error, exitCode: 1, elapsed };
        }

        const stdout = data?.run?.stdout || "";
        const stderr = data?.run?.stderr || data?.compile?.stderr || "";
        const exitCode = data?.run?.code ?? (stderr ? 1 : 0);

        setStatus(exitCode === 0 && !stderr ? "success" : "error");
        return { stdout, stderr, exitCode, elapsed };
      } catch (err: any) {
        const elapsed = performance.now() - t0;
        setExecutionTime(elapsed);
        setStatus("error");
        return { stdout: "", stderr: err.message || "Execution failed", exitCode: 1, elapsed };
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setExecutionTime(null);
  }, []);

  return { run, reset, status, executionTime };
}
