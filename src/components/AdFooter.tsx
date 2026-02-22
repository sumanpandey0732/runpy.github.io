import { useEffect, useRef } from "react";

export function AdFooter() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const safeSwap = (
      root: HTMLDivElement,
      id: string,
      url: string
    ) => {
      const cb = Date.now();

      // hidden buffer (new ad loads here)
      const buffer = document.createElement("div");
      buffer.id = id + "-buffer";
      buffer.style.position = "absolute";
      buffer.style.visibility = "hidden";
      buffer.style.pointerEvents = "none";

      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src = url + "?cb=" + cb;

      buffer.appendChild(script);
      root.appendChild(buffer);

      // swap after render delay
      setTimeout(() => {
        if (!root) return;

        const children = Array.from(root.children);

        // remove all except buffer
        children.forEach((c) => {
          if (c !== buffer) c.remove();
        });

        // show new ad
        buffer.style.position = "static";
        buffer.style.visibility = "visible";
        buffer.style.pointerEvents = "auto";
      }, 1200);
    };

    const loadAd1 = () => {
      if (!adRef1.current) return;
      safeSwap(
        adRef1.current,
        "container-cb676fc5c68bf473009afc5fd084f637",
        "https://walkeralacrityfavorite.com/cb676fc5c68bf473009afc5fd084f637/invoke.js"
      );
    };

    const loadAd2 = () => {
      if (!adRef2.current) return;
      safeSwap(
        adRef2.current,
        "container-ad3ffd8815977b191739e3734c05e473",
        "https://walkeralacrityfavorite.com/ad3ffd8815977b191739e3734c05e473/invoke.js"
      );
    };

    const loadAds = () => {
      loadAd1();
      setTimeout(loadAd2, 500);
    };

    loadAds();

    // 🔥 FORCE reload every 5s ALWAYS (no vanish)
    const interval = setInterval(loadAds, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full flex flex-row flex-wrap items-center justify-center gap-2 bg-secondary/40 border-t border-border overflow-hidden"
      style={{ minHeight: 60, maxHeight: 70 }}
      role="complementary"
      aria-label="Footer advertisement"
    >
      <div
        ref={adRef1}
        className="flex-1 flex justify-center overflow-hidden"
        style={{ minHeight: 50, maxHeight: 50 }}
      />
      <div
        ref={adRef2}
        className="flex-1 flex justify-center overflow-hidden"
        style={{ minHeight: 50, maxHeight: 50 }}
      />
    </div>
  );
}