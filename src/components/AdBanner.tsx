import { useEffect, useRef } from "react";

export function AdBanner() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ----- Ad 1 -----
    if (adRef1.current && adRef1.current.childElementCount === 0) {
      const container1 = document.createElement("div");
      container1.style.width = "468px";
      container1.style.height = "60px";
      adRef1.current.appendChild(container1);

      const script1 = document.createElement("script");
      script1.innerHTML = `
        atOptions = {
          'key' : '014d42d11ad0136f6c692bbc2fdebfac',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;
      container1.appendChild(script1);

      const invoke1 = document.createElement("script");
      invoke1.src =
        "https://www.highperformanceformat.com/014d42d11ad0136f6c692bbc2fdebfac/invoke.js";
      invoke1.async = true;
      container1.appendChild(invoke1);
    }

    // ----- Ad 2 -----
    if (adRef2.current && adRef2.current.childElementCount === 0) {
      const container2 = document.createElement("div");
      container2.id = "container-fdaea1020576c7e59be6278a10e6cde7";
      container2.style.width = "468px";
      container2.style.height = "60px";
      adRef2.current.appendChild(container2);

      const script2 = document.createElement("script");
      script2.src =
        "https://pl28715315.effectivegatecpm.com/fdaea1020576c7e59be6278a10e6cde7/invoke.js";
      script2.async = true;
      adRef2.current.appendChild(script2);
    }

    // Cleanup on unmount
    return () => {
      if (adRef1.current) adRef1.current.innerHTML = "";
      if (adRef2.current) adRef2.current.innerHTML = "";
    };
  }, []);

  return (
    <div
      className="w-full flex flex-wrap md:flex-nowrap items-center justify-center gap-2 overflow-x-auto bg-secondary/40 border-b border-border"
      style={{ minHeight: 70 }}
      role="complementary"
      aria-label="Advertisement"
    >
      <div ref={adRef1} />
      <div ref={adRef2} />
    </div>
  );
}