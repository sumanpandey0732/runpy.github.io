import { useEffect, useRef } from "react";

export function AdBanner() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && adRef.current.childElementCount === 0) {
      const optScript = document.createElement("script");
      optScript.innerHTML = `
        var atOptions = {
          'key' : 'e9293cbbeb206542184d8492110482df',
          'format' : 'iframe',
          'height' : 50,
          'width' : 468,
          'params' : {}
        };
      `;
      adRef.current.appendChild(optScript);

      const invoke = document.createElement("script");
      invoke.src = "https://www.highperformanceformat.com/e9293cbbeb206542184d8492110482df/invoke.js";
      invoke.async = true;
      adRef.current.appendChild(invoke);
    }
  }, []);

  return (
    <div
      className="w-full flex items-center justify-center bg-secondary/40 border-b border-border overflow-hidden"
      style={{ minHeight: 50, maxHeight: 60 }}
      role="complementary"
      aria-label="Advertisement"
    >
      <div ref={adRef} className="shrink-0 overflow-hidden" style={{ maxHeight: 50 }} />
    </div>
  );
}
