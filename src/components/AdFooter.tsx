import { useEffect, useRef } from "react";

declare global {
  interface Window {
    atOptions?: Record<string, unknown>;
  }
}

export function AdBanner() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  const intervalRef = useRef<number | null>(null);
  const timeoutRefs = useRef<number[]>([]);

  const loadAd = (ref: React.RefObject<HTMLDivElement>, key: string) => {
    if (!ref.current) return;

    // keep fixed size so layout doesn't jump
    ref.current.style.width = "320px";
    ref.current.style.height = "50px";
    ref.current.style.minWidth = "320px";
    ref.current.style.minHeight = "50px";

    const container = ref.current;

    window.atOptions = {
      key,
      format: "iframe",
      height: 50,
      width: 320,
      params: {},
    };

    const script = document.createElement("script");
    script.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
    script.async = true;

    // append new first
    container.appendChild(script);

    // remove old nodes AFTER new one inserted (prevents collapse)
    const t = window.setTimeout(() => {
      while (container.children.length > 1) {
        container.removeChild(container.firstChild as Node);
      }
    }, 800);

    timeoutRefs.current.push(t);
  };

  useEffect(() => {
    const doLoad = () => {
      loadAd(adRef1, "1611ca31419bb9c178b7e5a53931edb0");

      const t = window.setTimeout(() => {
        loadAd(adRef2, "28da3934f715b5b5eccce644d9633aa7");
      }, 500);

      timeoutRefs.current.push(t);
    };

    doLoad();

    intervalRef.current = window.setInterval(() => {
      doLoad();
    }, 5000);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      timeoutRefs.current.forEach((id) => window.clearTimeout(id));
      timeoutRefs.current = [];
    };
  }, []);

  return (
    <div
      className="w-full flex flex-row items-center justify-center gap-4 overflow-auto"
      role="complementary"
      aria-label="Advertisement"
    >
      <div ref={adRef1} />
      <div ref={adRef2} />
    </div>
  );
}