import { useEffect, useRef } from "react";

export function AdFooter() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ---- Ad 1 ----
    if (adRef1.current && adRef1.current.childElementCount === 0) {
      const opt1 = document.createElement("script");
      opt1.innerHTML = `
        var atOptions = {
          'key' : '1611ca31419bb9c178b7e5a53931edb0',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;
      adRef1.current.appendChild(opt1);

      const invoke1 = document.createElement("script");
      invoke1.src = "https://www.highperformanceformat.com/1611ca31419bb9c178b7e5a53931edb0/invoke.js";
      invoke1.async = true;
      adRef1.current.appendChild(invoke1);
    }

    // ---- Ad 2 ----
    if (adRef2.current && adRef2.current.childElementCount === 0) {
      const opt2 = document.createElement("script");
      opt2.innerHTML = `
        var atOptions = {
          'key' : '28da3934f715b5b5eccce644d9633aa7',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;
      adRef2.current.appendChild(opt2);

      const invoke2 = document.createElement("script");
      invoke2.src = "https://www.highperformanceformat.com/28da3934f715b5b5eccce644d9633aa7/invoke.js";
      invoke2.async = true;
      adRef2.current.appendChild(invoke2);
    }
  }, []);

  return (
    <div
      className="w-full flex items-center justify-center gap-3 bg-secondary/40 border-t border-border"
      style={{ minHeight: 60 }}
    >
      <div ref={adRef1} style={{ width: 320, height: 50 }} />
      <div ref={adRef2} style={{ width: 320, height: 50 }} />
    </div>
  );
}