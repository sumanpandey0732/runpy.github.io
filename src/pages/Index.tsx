import { useState, useCallback, useRef, useEffect } from "react";
import { usePyodide } from "@/hooks/use-pyodide";
import { useJsRunner } from "@/hooks/use-js-runner";
import { AppHeader } from "@/components/AppHeader";
import { CodeEditor } from "@/components/CodeEditor";
import { ConsoleOutput } from "@/components/ConsoleOutput";
import { AdBanner } from "@/components/AdBanner";
import { AdFooter } from "@/components/AdFooter";
import { ResizablePanels } from "@/components/ResizablePanels";
import { CompilerSidebar } from "@/components/CompilerSidebar";

const DEFAULT_PYTHON = `# Welcome to Python Compiler! 🐍
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

const DEFAULT_JS = `// Welcome to JavaScript Compiler! ⚡
// Write your JavaScript code and click Run (or Ctrl+Enter)

function fibonacci(n) {
  const result = [];
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    result.push(a);
    [a, b] = [b, a + b];
  }
  return result;
}

// Try it out!
console.log("Fibonacci sequence (first 10 terms):");
console.log(fibonacci(10));

console.log("\\nHello from JavaScript! 🎉");
`;

const Index = () => {
  const [language, setLanguage] = useState<"python" | "javascript">("python");
  const [pyCode, setPyCode] = useState(DEFAULT_PYTHON);
  const [jsCode, setJsCode] = useState(DEFAULT_JS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const code = language === "python" ? pyCode : jsCode;
  const setCode = language === "python" ? setPyCode : setJsCode;

  const py = usePyodide();
  const js = useJsRunner();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showConsole, setShowConsole] = useState(true);

  const status = language === "python" ? py.status : js.status;
  const entries = language === "python" ? py.entries : js.entries;
  const clearConsole = language === "python" ? py.clearConsole : js.clearConsole;
  const executionTime = language === "python" ? py.executionTime : null;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const timer = setTimeout(py.preload, 1500);
    return () => clearTimeout(timer);
  }, [py.preload]);

  const handleRun = useCallback(() => {
    if (language === "python") py.run(code);
    else js.run(code);
  }, [language, code, py, js]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "Enter") { e.preventDefault(); handleRun(); }
      if (mod && e.key === "k") { e.preventDefault(); clearConsole(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRun, clearConsole]);

  const handleDownload = useCallback(() => {
    const ext = language === "python" ? "py" : "js";
    const mime = language === "python" ? "text/x-python" : "text/javascript";
    const blob = new Blob([code], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `main.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, language]);

  const handleUpload = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCode(ev.target?.result as string);
    reader.readAsText(file);
    e.target.value = "";
  }, [setCode]);

  const editorPane = (
    <div className="h-full p-2">
      <CodeEditor code={code} onChange={setCode} status={status} language={language} />
    </div>
  );

  const consolePane = (
    <div className="h-full p-2">
      <ConsoleOutput entries={entries} onClear={clearConsole} executionTime={executionTime} />
    </div>
  );

  const fileAccept = language === "python" ? ".py,.txt" : ".js,.mjs,.txt";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: "var(--gradient-glow)" }} />
      {/* Secondary glow orbs */}
      <div className="fixed top-1/4 -right-32 w-96 h-96 rounded-full pointer-events-none z-0 opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(270, 60%, 60%), transparent 70%)" }} />
      <div className="fixed -bottom-32 -left-32 w-80 h-80 rounded-full pointer-events-none z-0 opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(174, 72%, 52%), transparent 70%)" }} />

      <CompilerSidebar
        language={language}
        onLanguageChange={setLanguage}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="relative z-10 flex flex-col h-full">
        <AdBanner />
        <AppHeader
          onRun={handleRun}
          onStop={language === "python" ? py.stop : () => {}}
          onClear={clearConsole}
          onDownload={handleDownload}
          onUpload={handleUpload}
          status={status}
          language={language}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept={fileAccept}
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />

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

        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-border text-xs text-muted-foreground bg-secondary/20">
          <span>
            {language === "python"
              ? `${py.pyodideVersion ? `Pyodide ${py.pyodideVersion}` : "Python 3.x"} • Ctrl+Enter to run`
              : "JavaScript (V8) • Ctrl+Enter to run"}
          </span>
          <span className="gradient-text font-semibold">World's Best Compiler ✨</span>
        </footer>
        <AdFooter />
      </div>
    </div>
  );
};

export default Index;
