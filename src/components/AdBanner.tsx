import { useEffect, useRef } from "react";

declare global {
  interface Window {
    atOptions?: Record<string, unknown>;
  }
}

export function AdBanner() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // -------- Ad 1 --------
    if (adRef1.current && adRef1.current.childElementCount === 0) {
      window.atOptions = {
        key: "1611ca31419bb9c178b7e5a53931edb0",
        format: "iframe",
        height: 50,
        width: 320,
        params: {},
      };

      const script1 = document.createElement("script");
      script1.src =
        "https://www.highperformanceformat.com/1611ca31419bb9c178b7e5a53931edb0/invoke.js";
      script1.async = true;
      adRef1.current.appendChild(script1);
    }

    // -------- Ad 2 (Delay to prevent overwrite) --------
    setTimeout(() => {
      if (adRef2.current && adRef2.current.childElementCount === 0) {
        window.atOptions = {
          key: "28da3934f715b5b5eccce644d9633aa7",
          format: "iframe",
          height: 50,
          width: 320,
          params: {},
        };

        const script2 = document.createElement("script");
        script2.src =
          "https://www.highperformanceformat.com/28da3934f715b5b5eccce644d9633aa7/invoke.js";
        script2.async = true;
        adRef2.current.appendChild(script2);
      }
    }, 500); // small delay
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