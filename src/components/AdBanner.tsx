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
    const doLoad = () => {
      // save scroll position
      const scrollY = window.scrollY;

      loadAd(adRef1, "1611ca31419bb9c178b7e5a53931edb0");

      const t = window.setTimeout(() => {
        loadAd(adRef2, "28da3934f715b5b5eccce644d9633aa7");

        // restore scroll after reload
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: "auto" });
        });
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