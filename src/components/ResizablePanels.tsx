import { useState, useCallback, useRef, useEffect } from "react";

interface ResizablePanelsProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function ResizablePanels({ left, right }: ResizablePanelsProps) {
  const [splitPercent, setSplitPercent] = useState(55);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.max(25, Math.min(75, pct)));
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex-1 flex min-h-0">
      {/* Left pane */}
      <div className="min-h-0 overflow-hidden" style={{ width: `${splitPercent}%` }}>
        {left}
      </div>

      {/* Resizer */}
      <div
        onMouseDown={handleMouseDown}
        className="w-1.5 cursor-col-resize flex-shrink-0 group relative hover:bg-primary/20 transition-colors"
        role="separator"
        aria-label="Resize panels"
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-border group-hover:bg-primary/50 transition-colors" />
      </div>

      {/* Right pane */}
      <div className="min-h-0 overflow-hidden flex-1">
        {right}
      </div>
    </div>
  );
}
