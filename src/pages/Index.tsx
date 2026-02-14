import { useState, useCallback, useRef, useEffect } from "react";
import { usePyodide } from "@/hooks/use-pyodide";
import { AppHeader } from "@/components/AppHeader";
import { CodeEditor } from "@/components/CodeEditor";
import { ConsoleOutput } from "@/components/ConsoleOutput";
import { AdBanner } from "@/components/AdBanner";
import { ResizablePanels } from "@/components/ResizablePanels";

const DEFAULT_CODE = `# Welcome to Python Compiler! 🐍
# Write your Python code and click Run (or Ctrl+Enter)

def fibonacci(n):
    """Generate Fibonacci sequence up to n terms"""
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

# Try it out!
print("Fibonacci sequence (first 10 terms):")
print(fibonacci(10))

print("\\nHello from Python in your browser! 🎉")
`;

const Index = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const { run, stop, clearConsole, preload, status, entries, executionTime, pyodideVersion } = usePyodide();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showConsole, setShowConsole] = useState(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Preload Pyodide on mount
  useEffect(() => {
    const timer = setTimeout(preload, 1500);
    return () => clearTimeout(timer);
  }, [preload]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "Enter") {
        e.preventDefault();
        run(code);
      }
      if (mod && e.key === "k") {
        e.preventDefault();
        clearConsole();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [code, run, clearConsole]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "main.py";
    a.click();
    URL.revokeObjectURL(url);
  }, [code]);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCode(ev.target?.result as string);
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const editorPane = (
    <div className="h-full p-2">
      <CodeEditor code={code} onChange={setCode} status={status} />
    </div>
  );

  const consolePane = (
    <div className="h-full p-2">
      <ConsoleOutput entries={entries} onClear={clearConsole} executionTime={executionTime} />
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "var(--gradient-glow)" }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <AdBanner />
        <AppHeader
          onRun={() => run(code)}
          onStop={stop}
          onClear={clearConsole}
          onDownload={handleDownload}
          onUpload={handleUpload}
          status={status}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".py,.txt"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />

        {/* Main content */}
        {isMobile ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0">{editorPane}</div>
            <button
              onClick={() => setShowConsole(!showConsole)}
              className="px-4 py-1.5 text-xs font-medium text-muted-foreground bg-secondary border-t border-border"
            >
              {showConsole ? "▼ Hide Console" : "▲ Show Console"}
            </button>
            {showConsole && <div className="h-[40vh] min-h-[200px]">{consolePane}</div>}
          </div>
        ) : (
          <ResizablePanels left={editorPane} right={consolePane} />
        )}

        {/* Footer */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-border text-xs text-muted-foreground bg-secondary/20">
          <span>
            {pyodideVersion ? `Pyodide ${pyodideVersion}` : "Python 3.x"} • Ctrl+Enter to run
          </span>
          <span>Built with ❤️ in the browser</span>
        </footer>
      </div>
    </div>
  );
};

export default Index;
