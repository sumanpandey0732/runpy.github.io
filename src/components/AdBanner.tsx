import { useEffect, useRef } from "react";

export function AdBanner() {
  const topAd1 = useRef<HTMLDivElement>(null);
  const topAd2 = useRef<HTMLDivElement>(null);
  const bottomAd1 = useRef<HTMLDivElement>(null);
  const bottomAd2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAd = (
      ref: HTMLDivElement | null,
      key: string,
      containerId?: string
    ) => {
      if (!ref || ref.childElementCount > 0) return;

      // Create container div
      const container = document.createElement("div");
      container.style.width = "468px";
      container.style.height = "60px";
      if (containerId) container.id = containerId;
      ref.appendChild(container);

      // Check if normal atOptions ad or external async ad
      if (key.includes("effectivegatecpm.com")) {
        const script = document.createElement("script");
        script.src = key;
        script.async = true;
        ref.appendChild(script);
      } else {
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

    // ----- Load all ads -----
    loadAd(topAd1.current, "014d42d11ad0136f6c692bbc2fdebfac"); // Top Ad 1
    loadAd(topAd2.current, "https://pl28715315.effectivegatecpm.com/fdaea1020576c7e59be6278a10e6cde7/invoke.js", "container-fdaea1020576c7e59be6278a10e6cde7"); // Top Ad 2
    loadAd(bottomAd1.current, "014d42d11ad0136f6c692bbc2fdebfac"); // Bottom Ad 1
    loadAd(bottomAd2.current, "https://pl28715315.effectivegatecpm.com/fdaea1020576c7e59be6278a10e6cde7/invoke.js", "container-fdaea1020576c7e59be6278a10e6cde7"); // Bottom Ad 2

    // Cleanup
    return () => {
      [topAd1, topAd2, bottomAd1, bottomAd2].forEach(ref => {
        if (ref.current) ref.current.innerHTML = "";
      });
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Top Ads */}
      <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-center gap-2">
        <div ref={topAd1} />
        <div ref={topAd2} />
      </div>

      {/* Bottom Ads */}
      <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-center gap-2">
        <div ref={bottomAd1} />
        <div ref={bottomAd2} />
      </div>
    </div>
  );
}