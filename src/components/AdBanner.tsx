import { useEffect, useRef } from "react";

export function AdBanner() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return; // Prevent double run
    loaded.current = true;

    const loadAd = (
      container: HTMLDivElement,
      key: string,
      width: number,
      height: number
    ) => {
      const optionsScript = document.createElement("script");
      optionsScript.innerHTML = `
        (function() {
          var atOptions = {
            key: '${key}',
            format: 'iframe',
            height: ${height},
            width: ${width},
            params: {}
          };
          var s = document.createElement('script');
          s.src = 'https://www.highperformanceformat.com/${key}/invoke.js';
          s.async = false;
          document.currentScript.parentNode.appendChild(s);
        })();
      `;
      container.appendChild(optionsScript);
    };

    if (adRef1.current) {
      loadAd(adRef1.current, "1611ca31419bb9c178b7e5a53931edb0", 320, 50);
    }

    if (adRef2.current) {
      loadAd(adRef2.current, "28da3934f715b5b5eccce644d9633aa7", 468, 60);
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ width: 320, height: 50 }} ref={adRef1}></div>
      <div style={{ width: 468, height: 60 }} ref={adRef2}></div>
    </div>
  );
}