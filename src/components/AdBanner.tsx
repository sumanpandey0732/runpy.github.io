import { useEffect, useRef } from "react";

export function AdBanner() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // -------- Ad 1 (320x50) --------
    if (adRef1.current) {
      const s1 = document.createElement("script");
      s1.innerHTML = `
        var atOptions = {
          'key' : '1611ca31419bb9c178b7e5a53931edb0',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;

      const s1Invoke = document.createElement("script");
      s1Invoke.src =
        "https://www.highperformanceformat.com/1611ca31419bb9c178b7e5a53931edb0/invoke.js";
      s1Invoke.async = false;

      adRef1.current.appendChild(s1);
      adRef1.current.appendChild(s1Invoke);
    }

    // -------- Ad 2 (320x100) --------
    if (adRef2.current) {
      const s2 = document.createElement("script");
      s2.innerHTML = `
        var atOptions = {
          'key' : '28da3934f715b5b5eccce644d9633aa7',
          'format' : 'iframe',
          'height' : 100,
          'width' : 320,
          'params' : {}
        };
      `;

      const s2Invoke = document.createElement("script");
      s2Invoke.src =
        "https://www.highperformanceformat.com/28da3934f715b5b5eccce644d9633aa7/invoke.js";
      s2Invoke.async = false;

      adRef2.current.appendChild(s2);
      adRef2.current.appendChild(s2Invoke);
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ width: 320, height: 50 }} ref={adRef1}></div>
      <div style={{ width: 320, height: 100 }} ref={adRef2}></div>
    </div>
  );
}