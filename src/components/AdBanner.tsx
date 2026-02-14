import { useEffect, useRef } from "react";

export function AdBanner() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current || adRef.current.childElementCount > 0) return;

    // 1️⃣ Create configuration script
    const configScript = document.createElement("script");
    configScript.innerHTML = `
      window.atOptions = {
        'key' : 'e9293cbbeb206542184d8492110482df',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;
    adRef.current.appendChild(configScript);

    // 2️⃣ Load external invoke script
    const invokeScript = document.createElement("script");
    invokeScript.src =
      "https://www.highperformanceformat.com/e9293cbbeb206542184d8492110482df/invoke.js";
    invokeScript.async = true;

    adRef.current.appendChild(invokeScript);

    // 3️⃣ Cleanup when unmounting
    return () => {
      if (adRef.current) {
        adRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
      id="ad-banner"
      ref={adRef}
      className="w-full bg-secondary/40 border-b border-border flex items-center justify-center overflow-hidden"
      style={{ minHeight: 70 }}
      role="complementary"
      aria-label="Advertisement"
    />
  );
}