import { useEffect, useRef } from "react";

export function AdFooter() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef1.current && adRef1.current.childElementCount === 0) {
      const container = document.createElement("div");
      container.style.width = "468px";
      container.style.height = "60px";
      adRef1.current.appendChild(container);

      const script = document.createElement("script");
      script.innerHTML = `
        atOptions = {
          'key' : '014d42d11ad0136f6c692bbc2fdebfac',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;
      container.appendChild(script);

      const invoke = document.createElement("script");
      invoke.src = "https://www.highperformanceformat.com/014d42d11ad0136f6c692bbc2fdebfac/invoke.js";
      invoke.async = true;
      container.appendChild(invoke);
    }

    if (adRef2.current && adRef2.current.childElementCount === 0) {
      const container = document.createElement("div");
      container.style.width = "468px";
      container.style.height = "60px";
      container.id = "container-fdaea1020576c7e59be6278a10e6cde7-footer";
      adRef2.current.appendChild(container);

      const script = document.createElement("script");
      script.src = "https://pl28715315.effectivegatecpm.com/fdaea1020576c7e59be6278a10e6cde7/invoke.js";
      script.async = true;
      adRef2.current.appendChild(script);
    }

    return () => {
      if (adRef1.current) adRef1.current.innerHTML = "";
      if (adRef2.current) adRef2.current.innerHTML = "";
    };
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
