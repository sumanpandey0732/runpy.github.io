import { useEffect, useRef } from "react";

export function AdBanner() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAd = (ref: HTMLDivElement | null, key: string) => {
      if (!ref || ref.childElementCount > 0) return;

      const configScript = document.createElement("script");
      configScript.innerHTML = `
        window.atOptions = {
          'key' : '${key}',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;
      ref.appendChild(configScript);

      const invokeScript = document.createElement("script");
      invokeScript.src = \`https://www.highperformanceformat.com/${key}/invoke.js\`;
      invokeScript.async = true;

      ref.appendChild(invokeScript);
    };

    loadAd(adRef1.current, "e9293cbbeb206542184d8492110482df");
    loadAd(adRef2.current, "014d42d11ad0136f6c692bbc2fdebfac");

    return () => {
      if (adRef1.current) adRef1.current.innerHTML = "";
      if (adRef2.current) adRef2.current.innerHTML = "";
    };
  }, []);

  return (
    <div
      className="w-full bg-secondary/40 border-b border-border flex items-center justify-center gap-2 overflow-x-auto"
      style={{ minHeight: 70 }}
      role="complementary"
      aria-label="Advertisement"
    >
      <div ref={adRef1} />
      <div ref={adRef2} />
    </div>
  );
}