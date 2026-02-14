import { useEffect, useRef, useState } from "react";

export function AdBanner() {
  const topAd1 = useRef<HTMLDivElement>(null);
  const topAd2 = useRef<HTMLDivElement>(null);
  const bottomAd1 = useRef<HTMLDivElement>(null);
  const bottomAd2 = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if desktop for bottom ads
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    // ----- Top Ads -----
    const loadTopAd = (ref: HTMLDivElement | null, key: string, containerId?: string) => {
      if (!ref || ref.childElementCount > 0) return;
      const container = document.createElement("div");
      container.style.width = "468px";
      container.style.height = "60px";
      if (containerId) container.id = containerId;
      ref.appendChild(container);

      if (key.includes("effectivegatecpm")) {
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

    // Top ads
    loadTopAd(topAd1.current, "014d42d11ad0136f6c692bbc2fdebfac");
    loadTopAd(topAd2.current, "https://pl28715315.effectivegatecpm.com/fdaea1020576c7e59be6278a10e6cde7/invoke.js", "container-fdaea1020576c7e59be6278a10e6cde7");

    // Bottom ads (desktop only)
    if (isDesktop) {
      loadTopAd(bottomAd1.current, "014d42d11ad0136f6c692bbc2fdebfac");
      loadTopAd(bottomAd2.current, "https://pl28715315.effectivegatecpm.com/fdaea1020576c7e59be6278a10e6cde7/invoke.js", "container-fdaea1020576c7e59be6278a10e6cde7");
    }

    // Cleanup
    return () => {
      [topAd1, topAd2, bottomAd1, bottomAd2].forEach(ref => {
        if (ref.current) ref.current.innerHTML = "";
      });
    };
  }, [isDesktop]);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Top Ads */}
      <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-center gap-2">
        <div ref={topAd1} />
        <div ref={topAd2} />
      </div>

      {/* Bottom Ads (Desktop Only) */}
      {isDesktop && (
        <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-center gap-2 mt-4">
          <div ref={bottomAd1} />
          <div ref={bottomAd2} />
        </div>
      )}
    </div>
  );
}