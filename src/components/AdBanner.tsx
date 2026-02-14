import { useEffect, useRef } from "react";

export function AdBanner() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current || adRef.current.childElementCount > 0) return;

    const configScript = document.createElement("script");
    configScript.innerHTML = `
      atOptions = {
        'key' : 'e9293cbbeb206542184d8492110482df',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;
    adRef.current.appendChild(configScript);

    const invokeScript = document.createElement("script");
    invokeScript.src = "https://www.highperformanceformat.com/e9293cbbeb206542184d8492110482df/invoke.js";
    adRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div
      id="ad-banner"
      ref={adRef}
      className="w-full bg-secondary/40 border-b border-border flex items-center justify-center overflow-hidden"
      style={{ minHeight: 60 }}
      role="complementary"
      aria-label="Advertisement"
    />
  );
}
