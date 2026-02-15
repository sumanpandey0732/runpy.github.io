import { useEffect, useRef } from "react";

export function AdFooter() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ad 1: atOptions-based
    if (adRef1.current && adRef1.current.childElementCount === 0) {
      const optScript = document.createElement("script");
      optScript.innerHTML = `
        var atOptions = {
          'key' : '014d42d11ad0136f6c692bbc2fdebfac',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;
      adRef1.current.appendChild(optScript);

      const invoke = document.createElement("script");
      invoke.src = "https://www.highperformanceformat.com/014d42d11ad0136f6c692bbc2fdebfac/invoke.js";
      invoke.async = true;
      adRef1.current.appendChild(invoke);
    }

    // Ad 2: container-based
    if (adRef2.current && adRef2.current.childElementCount === 0) {
      const container = document.createElement("div");
      container.id = "container-fdaea1020576c7e59be6278a10e6cde7-footer";
      adRef2.current.appendChild(container);

      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src = "https://pl28715315.effectivegatecpm.com/fdaea1020576c7e59be6278a10e6cde7/invoke.js";
      adRef2.current.appendChild(script);
    }
  }, []);

  return (
    <div
      className="w-full flex flex-wrap items-center justify-center gap-2 bg-secondary/40 border-t border-border overflow-hidden"
      style={{ minHeight: 70, maxHeight: 80 }}
      role="complementary"
      aria-label="Footer advertisement"
    >
      <div ref={adRef1} className="shrink-0 overflow-hidden" style={{ maxHeight: 60 }} />
      <div ref={adRef2} className="shrink-0 overflow-hidden" style={{ maxHeight: 60 }} />
    </div>
  );
}
