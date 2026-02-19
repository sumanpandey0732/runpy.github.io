import { Code2, Terminal, Menu, X, Sparkles } from "lucide-react";

interface CompilerSidebarProps {
  language: "python" | "javascript";
  onLanguageChange: (lang: "python" | "javascript") => void;
  open: boolean;
  onToggle: () => void;
}

export function CompilerSidebar({ language, onLanguageChange, open, onToggle }: CompilerSidebarProps) {
  return (
    <>
      {/* Hamburger toggle button - always visible at top */}
      <button
        onClick={onToggle}
        className="fixed left-3 top-3 z-40 p-2 rounded-xl bg-secondary/80 text-foreground border border-border
          shadow-lg hover:bg-primary/20 hover:text-primary transition-all hover:shadow-[var(--shadow-glow)]"
        aria-label={open ? "Close sidebar" : "Open sidebar"}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar panel */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-30 w-56 glass border-r border-border flex flex-col
          transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Compilers</h2>
              <p className="text-[10px] text-muted-foreground">Choose language</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-2">
          <SidebarItem
            icon={<span className="text-lg">🐍</span>}
            label="Python"
            desc="Pyodide WASM"
            active={language === "python"}
            onClick={() => { onLanguageChange("python"); onToggle(); }}
          />
          <SidebarItem
            icon={<Code2 className="w-5 h-5 text-yellow-400" />}
            label="JavaScript"
            desc="Browser V8"
            active={language === "javascript"}
            onClick={() => { onLanguageChange("javascript"); onToggle(); }}
          />
        </nav>

        <div className="p-3 border-t border-border">
          <div className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
            <Terminal className="w-3 h-3" />
            Developed by Santosh pandey 
          </div>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-20 bg-background/40 backdrop-blur-sm md:hidden" onClick={onToggle} />
      )}
    </>
  );
}

function SidebarItem({ icon, label, desc, active, onClick }: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200
        ${active
          ? "bg-primary/15 border border-primary/30 shadow-[var(--shadow-glow)] text-foreground"
          : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground border border-transparent"
        }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${active ? "bg-primary/20" : "bg-secondary/50"}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-[10px] text-muted-foreground">{desc}</div>
      </div>
    </button>
  );
}
