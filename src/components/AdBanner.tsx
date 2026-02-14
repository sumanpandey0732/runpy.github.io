import { useEffect, useRef } from "react";

export function AdBanner() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAd = (ref: HTMLDivElement | null, key: string, containerId?: string) => {
      if (!ref || ref.childElementCount > 0) return;

      const container = document.createElement("div");
      container.style.width = "468px";
      container.style.height = "60px";
      if (containerId) container.id = containerId;
      ref.appendChild(container);

      if (key.includes("effectivegatecpm.com")) {
        // External async ad
        const script = document.createElement("script");
        script.src = key;
        script.async = true;
        ref.appendChild(script);
      } else {
        // Normal atOptions ad
        const script1 = document.createElement("script");
        script1.innerHTML = `
          atOptions = {
            'key' : '${key}',
            'format' : 'iframe',
            'height' : 60,
            'width' : 468,
            'params' : {}
          };
        `;
        container.appendChild(script1);

        const invoke = document.createElement("script");
        invoke.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
        invoke.async = true;
        container.appendChild(invoke);
      }
    };

    loadAd(adRef1.current, "014d42d11ad0136f6c692bbc2fdebfac"); // Ad 1
    loadAd(adRef2.current, "https://pl28715315.effectivegatecpm.com/fdaea1020576c7e59be6278a10e6cde7/invoke.js", "container-fdaea1020576c7e59be6278a10e6cde7"); // Ad 2

    return () => {
      if (adRef1.current) adRef1.current.innerHTML = "";
      if (adRef2.current) adRef2.current.innerHTML = "";
    };
  }, []);

  return (
    <div
      className="w-full flex flex-wrap md:flex-nowrap items-center justify-center gap-2 bg-secondary/40 border-b border-border"
      style={{ minHeight: 70 }}
      role="complementary"
      aria-label="Advertisement"
    >
      <div ref={adRef1} />
      <div ref={adRef2} />
    </div>
  );
}