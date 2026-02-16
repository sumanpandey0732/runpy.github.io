import { useEffect, useRef } from "react";

export function AdBanner() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // -------- Load Ad 1 --------
    if (adRef1.current) {
      const script1Options = document.createElement("script");
      script1Options.innerHTML = `
        var atOptions = {
          'key' : '1611ca31419bb9c178b7e5a53931edb0',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;

      const script1 = document.createElement("script");
      script1.src =
        "https://www.highperformanceformat.com/1611ca31419bb9c178b7e5a53931edb0/invoke.js";
      script1.async = false;

      script1.onload = () => {
        // -------- Load Ad 2 AFTER Ad 1 --------
        if (adRef2.current) {
          const script2Options = document.createElement("script");
          script2Options.innerHTML = `
            var atOptions = {
              'key' : '28da3934f715b5b5eccce644d9633aa7',
              'format' : 'iframe',
              'height' : 50,
              'width' : 320,
              'params' : {}
            };
          `;

          const script2 = document.createElement("script");
          script2.src =
            "https://www.highperformanceformat.com/28da3934f715b5b5eccce644d9633aa7/invoke.js";
          script2.async = false;

          adRef2.current.appendChild(script2Options);
          adRef2.current.appendChild(script2);
        }
      };

      adRef1.current.appendChild(script1Options);
      adRef1.current.appendChild(script1);
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ width: 320, height: 50 }} ref={adRef1}></div>
      <div style={{ width: 320, height: 50 }} ref={adRef2}></div>
    </div>
  );
}