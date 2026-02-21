import { useEffect, useRef } from "react";

declare global {
  interface Window {
    atOptions?: Record<string, unknown>;
  }
}

export function AdBanner() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  // refs to keep interval / timeouts so we can clear on unmount
  const intervalRef = useRef<number | null>(null);
  const timeoutRefs = useRef<number[]>([]);

  // helper to (re)load an ad into a ref using the given key
  const loadAd = (ref: React.RefObject<HTMLDivElement>, key: string) => {
    if (!ref.current) return;

    // --- KEEP THE CONTAINER SIZE STABLE TO AVOID LAYOUT JUMP ---
    // force fixed size that matches the ad iframe size
    ref.current.style.boxSizing = "border-box";
    ref.current.style.width = "320px";
    ref.current.style.minWidth = "320px";
    ref.current.style.height = "50px";
    ref.current.style.minHeight = "50px";
    ref.current.style.display = "inline-block";
    ref.current.style.verticalAlign = "middle";
    // optional: prevent focus-caused jumps
    ref.current.tabIndex = -1;
    // ---------------------------------------------------------

    // remove existing children so script can be re-inserted cleanly
    while (ref.current.firstChild) {
      ref.current.removeChild(ref.current.firstChild);
    }

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
    ref.current.appendChild(script);
  };

  useEffect(() => {
    // loader that keeps the original 500ms offset for ad2
    const doLoad = () => {
      loadAd(adRef1, "1611ca31419bb9c178b7e5a53931edb0");

      const t = window.setTimeout(() => {
        loadAd(adRef2, "28da3934f715b5b5eccce644d9633aa7");
      }, 500);
      timeoutRefs.current.push(t);
    };

    // initial load
    doLoad();

    // repeat every 5 seconds
    intervalRef.current = window.setInterval(() => {
      doLoad();
    }, 5000);

    // cleanup on unmount
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