import { useState, useCallback, useRef, useEffect } from "react";
import { useCodeRunner } from "@/hooks/use-code-runner";
import { AppHeader } from "@/components/AppHeader";
import { CodeEditor } from "@/components/CodeEditor";
import { XTerminal, type XTerminalHandle } from "@/components/XTerminal";
import { StdinInput } from "@/components/StdinInput";
import { AdBanner } from "@/components/AdBanner";
import { AdFooter } from "@/components/AdFooter";
import { ResizablePanels } from "@/components/ResizablePanels";
import { CompilerSidebar } from "@/components/CompilerSidebar";
import { MobileRunButton } from "@/components/MobileRunButton";
import { Terminal, X } from "lucide-react";

const DEFAULT_PYTHON = `# Welcome to Python Compiler! 🐍
# Write your Python code and click Run (or Ctrl+Enter)
# Real Python execution — supports input(), loops, errors

name = input("Enter your name: ")
age = input("Enter your age: ")
print(f"Hello {name}! You are {age} years old. 🎉")

for i in range(5):
    print(f"  Count: {i}")
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

console.log("Fibonacci sequence (first 10 terms):");
console.log(fibonacci(10));
console.log("\\nHello from JavaScript! 🎉");
`;

const Index = () => {
  const [language, setLanguage] = useState<"python" | "javascript">("python");
  const [pyCode, setPyCode] = useState(DEFAULT_PYTHON);
  const [jsCode, setJsCode] = useState(DEFAULT_JS);
  const [stdinText, setStdinText] = useState("Alice\n25");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const code = language === "python" ? pyCode : jsCode;
  const setCode = language === "python" ? setPyCode : setJsCode;

  const { run, status, executionTime } = useCodeRunner();
  const termRef = useRef<XTerminalHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleRun = useCallback(async () => {
    if (isMobile) setShowConsole(true);
    setHasOutput(true);

    const term = termRef.current;
    if (term) {
      term.clear();
      term.writeln(`\x1b[38;2;100;200;180m$ ${language === "python" ? "python" : "node"} main.${language === "python" ? "py" : "js"}\x1b[0m`);
      term.writeln("");
    }

    const stdin = language === "python" ? stdinText : "";
    const result = await run(code, language, stdin);

    if (term) {
      // Write stdout
      if (result.stdout) {
        const lines = result.stdout.split("\n");
        lines.forEach((line, i) => {
          if (i < lines.length - 1 || line) {
            term.writeln(line);
          }
        });
      }

      // Write stderr in red
      if (result.stderr) {
        const lines = result.stderr.split("\n");
        lines.forEach((line, i) => {
          if (i < lines.length - 1 || line) {
            term.writeln(`\x1b[31m${line}\x1b[0m`);
          }
        });
      }

      // Execution summary
      term.writeln("");
      const elapsed = result.elapsed < 1000
        ? `${result.elapsed.toFixed(0)}ms`
        : `${(result.elapsed / 1000).toFixed(2)}s`;

      if (result.exitCode === 0 && !result.stderr) {
        term.writeln(`\x1b[32m✓ Process exited with code 0 (${elapsed})\x1b[0m`);
      } else {
        term.writeln(`\x1b[31m✗ Process exited with code ${result.exitCode} (${elapsed})\x1b[0m`);
      }
      term.writeln("");
    }
  }, [language, code, run, isMobile, stdinText]);

  const handleClear = useCallback(() => {
    termRef.current?.reset();
    setHasOutput(false);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "Enter") { e.preventDefault(); handleRun(); }
      if (mod && e.key === "k") { e.preventDefault(); handleClear(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRun, handleClear]);

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
    <div className="h-full flex flex-col gap-2 p-1 sm:p-2">
      <div className="flex-1 min-h-0">
        <CodeEditor code={code} onChange={setCode} status={status} language={language} />
      </div>
      {language === "python" && (
        <StdinInput value={stdinText} onChange={setStdinText} />
      )}
    </div>
  );

  const consolePane = (
    <div className="h-full p-1 sm:p-2">
      <XTerminal ref={termRef} />
    </div>
  );

  const fileAccept = language === "python" ? ".py,.txt" : ".js,.mjs,.txt";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: "var(--gradient-glow)" }} />
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
          onStop={() => {}}
          onClear={handleClear}
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
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="flex-1 min-h-0 overflow-y-auto">{editorPane}</div>

            {showConsole && (
              <div className="absolute inset-0 z-30 flex flex-col bg-background/95 backdrop-blur-sm animate-slide-up">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Terminal</span>
                  </div>
                  <button
                    onClick={() => setShowConsole(false)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 min-h-0">{consolePane}</div>
              </div>
            )}

            {!showConsole && hasOutput && (
              <button
                onClick={() => setShowConsole(true)}
                className="fixed bottom-6 left-6 z-30 flex items-center gap-2 px-3 py-2 rounded-xl
                  bg-secondary/90 border border-border text-foreground text-xs font-medium
                  shadow-lg hover:bg-secondary transition-all md:hidden"
              >
                <Terminal className="w-3.5 h-3.5 text-primary" />
                <span>Terminal</span>
              </button>
            )}
          </div>
        ) : (
          <ResizablePanels left={editorPane} right={consolePane} />
        )}

        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-border text-xs text-muted-foreground bg-secondary/20">
          <span className="hidden sm:inline">
            {language === "python"
              ? "Python 3.10 (Real Execution) • Ctrl+Enter to run"
              : "JavaScript (Node 18) • Ctrl+Enter to run"}
          </span>
          <span className="sm:hidden text-[10px]">
            {language === "python" ? "Python 3.10" : "JS (Node 18)"}
          </span>
          <span className="gradient-text font-semibold text-[10px] sm:text-xs">
            {executionTime !== null && `${executionTime < 1000 ? `${executionTime.toFixed(0)}ms` : `${(executionTime / 1000).toFixed(2)}s`} • `}
            Developed by Santosh pandey ✨
          </span>
        </footer>
        <AdFooter />
      </div>

      {isMobile && !showConsole && <MobileRunButton onRun={handleRun} />}
    </div>
  );
};

export default Index;
