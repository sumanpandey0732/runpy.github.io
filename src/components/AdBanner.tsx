import { useEffect, useRef } from "react";

export function AdBanner() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ad 1: atOptions-based
    if (adRef1.current && adRef1.current.childElementCount === 0) {
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
      adRef1.current.appendChild(optScript);

      const invoke = document.createElement("script");
      invoke.src = "https://www.highperformanceformat.com/e9293cbbeb206542184d8492110482df/invoke.js";
      invoke.async = true;
      adRef1.current.appendChild(invoke);
    }

    // Ad 2: container-based (unique to header)
    if (adRef2.current && adRef2.current.childElementCount === 0) {
      const container = document.createElement("div");
      container.id = "container-fdaea1020576c7e59be6278a10e6cde7-header";
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
      className="w-full flex flex-wrap items-center justify-center gap-2 bg-secondary/40 border-b border-border overflow-hidden"
      style={{ minHeight: 50, maxHeight: 60 }}
      role="complementary"
      aria-label="Advertisement"
    >
      <div ref={adRef1} className="shrink-0 overflow-hidden" style={{ maxHeight: 50 }} />
      <div ref={adRef2} className="shrink-0 overflow-hidden" style={{ maxHeight: 50 }} />
    </div>
  );
}
