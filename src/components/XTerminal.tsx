import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";

export interface XTerminalHandle {
  write: (text: string) => void;
  writeln: (text: string) => void;
  clear: () => void;
  focus: () => void;
  reset: () => void;
}

interface XTerminalProps {
  onData?: (data: string) => void;
}

export const XTerminal = forwardRef<XTerminalHandle, XTerminalProps>(
  ({ onData }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<Terminal | null>(null);
    const fitRef = useRef<FitAddon | null>(null);

    const writeFn = useCallback((text: string) => {
      termRef.current?.write(text);
    }, []);

    const writelnFn = useCallback((text: string) => {
      termRef.current?.writeln(text);
    }, []);

    const clearFn = useCallback(() => {
      termRef.current?.clear();
      termRef.current?.reset();
    }, []);

    const focusFn = useCallback(() => {
      termRef.current?.focus();
    }, []);

    const resetFn = useCallback(() => {
      clearFn();
      termRef.current?.writeln("\x1b[38;2;100;200;180m╭──────────────────────────────────────────╮\x1b[0m");
      termRef.current?.writeln("\x1b[38;2;100;200;180m│\x1b[0m  \x1b[1;38;2;80;220;200m⚡ Python & JS Compiler\x1b[0m                  \x1b[38;2;100;200;180m│\x1b[0m");
      termRef.current?.writeln("\x1b[38;2;100;200;180m│\x1b[0m  \x1b[38;2;140;140;160mReal execution • Ctrl+Enter to run\x1b[0m     \x1b[38;2;100;200;180m│\x1b[0m");
      termRef.current?.writeln("\x1b[38;2;100;200;180m╰──────────────────────────────────────────╯\x1b[0m");
      termRef.current?.writeln("");
    }, [clearFn]);

    useImperativeHandle(ref, () => ({
      write: writeFn,
      writeln: writelnFn,
      clear: clearFn,
      focus: focusFn,
      reset: resetFn,
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const term = new Terminal({
        theme: {
          background: "#0d1117",
          foreground: "#e2e8f0",
          cursor: "#22d3ee",
          cursorAccent: "#0d1117",
          selectionBackground: "#22d3ee33",
          selectionForeground: "#e2e8f0",
          black: "#0d1117",
          red: "#f87171",
          green: "#4ade80",
          yellow: "#fbbf24",
          blue: "#60a5fa",
          magenta: "#c084fc",
          cyan: "#22d3ee",
          white: "#e2e8f0",
          brightBlack: "#6b7280",
          brightRed: "#fca5a5",
          brightGreen: "#86efac",
          brightYellow: "#fde68a",
          brightBlue: "#93c5fd",
          brightMagenta: "#d8b4fe",
          brightCyan: "#67e8f9",
          brightWhite: "#f8fafc",
        },
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontSize: 14,
        lineHeight: 1.4,
        cursorBlink: true,
        cursorStyle: "block",
        scrollback: 5000,
        convertEol: true,
        allowProposedApi: true,
      });

      const fit = new FitAddon();
      const webLinks = new WebLinksAddon();
      term.loadAddon(fit);
      term.loadAddon(webLinks);
      term.open(containerRef.current);

      // Initial fit
      requestAnimationFrame(() => {
        fit.fit();
      });

      // Show welcome
      term.writeln("\x1b[38;2;100;200;180m╭──────────────────────────────────────────╮\x1b[0m");
      term.writeln("\x1b[38;2;100;200;180m│\x1b[0m  \x1b[1;38;2;80;220;200m⚡ Python & JS Compiler\x1b[0m                  \x1b[38;2;100;200;180m│\x1b[0m");
      term.writeln("\x1b[38;2;100;200;180m│\x1b[0m  \x1b[38;2;140;140;160mReal execution • Ctrl+Enter to run\x1b[0m     \x1b[38;2;100;200;180m│\x1b[0m");
      term.writeln("\x1b[38;2;100;200;180m╰──────────────────────────────────────────╯\x1b[0m");
      term.writeln("");

      if (onData) {
        term.onData(onData);
      }

      termRef.current = term;
      fitRef.current = fit;

      const ro = new ResizeObserver(() => {
        requestAnimationFrame(() => fit.fit());
      });
      ro.observe(containerRef.current);

      return () => {
        ro.disconnect();
        term.dispose();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className="h-full w-full rounded-xl overflow-hidden border border-border bg-[#0d1117] shadow-[var(--shadow-card)]">
        <div
          ref={containerRef}
          className="h-full w-full"
          style={{ padding: "8px" }}
        />
      </div>
    );
  }
);

XTerminal.displayName = "XTerminal";
