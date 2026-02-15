import { useEffect, useRef } from "react";

export function AdBanner() {
  const adRef1 = useRef<HTMLDivElement>(null); // 728x90
  const adRef2 = useRef<HTMLDivElement>(null); // 320x50

  useEffect(() => {
    // -------- Ad 1 --------
    if (adRef1.current && adRef1.current.childElementCount === 0) {
      const optScript1 = document.createElement("script");
      optScript1.innerHTML = `
        var atOptions = {
          'key' : '1611ca31419bb9c178b7e5a53931edb0',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      adRef1.current.appendChild(optScript1);

      const invoke1 = document.createElement("script");
      invoke1.src =
        "https://www.highperformanceformat.com/1611ca31419bb9c178b7e5a53931edb0/invoke.js";
      invoke1.async = true;
      adRef1.current.appendChild(invoke1);
    }

    // -------- Ad 2 --------
    if (adRef2.current && adRef2.current.childElementCount === 0) {
      const optScript2 = document.createElement("script");
      optScript2.innerHTML = `
        var atOptions = {
          'key' : '28da3934f715b5b5eccce644d9633aa7',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;
      adRef2.current.appendChild(optScript2);

      const invoke2 = document.createElement("script");
      invoke2.src =
        "https://www.highperformanceformat.com/28da3934f715b5b5eccce644d9633aa7/invoke.js";
      invoke2.async = true;
      adRef2.current.appendChild(invoke2);
    }
  }, []);

  return (
    <div
      className="w-full flex flex-row items-center justify-center gap-4 overflow-auto bg-secondary/40 border-b border-border"
      role="complementary"
      aria-label="Advertisement"
    >
      <div ref={adRef1} className="shrink-0" />
      <div ref={adRef2} className="shrink-0" />
    </div>
  );
}