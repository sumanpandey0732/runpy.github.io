import { useEffect, useRef } from "react";

export function AdBanner() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current || adRef.current.childElementCount > 0) return;

    const configScript = document.createElement("script");
    configScript.innerHTML = `
      atOptions = {
    'key' :'10fd235b871c37edc6413cb41ff6db48',
    'format' : 'iframe',
    'height' : 50,
    'width' : 320,
    'params' : {}',
 
      };
    `;
    adRef.current.appendChild(configScript);

    const invokeScript = document.createElement("script");
    invokeScript.src = "https://www.highperformanceformat.com/10fd235b871c37edc6413cb41ff6db48/invoke.js";
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
