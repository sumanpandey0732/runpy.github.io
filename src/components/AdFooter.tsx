import { useEffect, useRef } from "react";

export function AdFooter() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAd1 = () => {
      if (!adRef1.current) return;

      // don't reload if ad still exists
      if (adRef1.current.childElementCount > 0) return;

      const cb = Date.now();

      const container = document.createElement("div");
      container.id = "container-cb676fc5c68bf473009afc5fd084f637";
      adRef1.current.appendChild(container);

      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src =
        "https://walkeralacrityfavorite.com/cb676fc5c68bf473009afc5fd084f637/invoke.js?cb=" +
        cb;

      adRef1.current.appendChild(script);
    };

    const loadAd2 = () => {
      if (!adRef2.current) return;

      if (adRef2.current.childElementCount > 0) return;

      const cb = Date.now();

      const container = document.createElement("div");
      container.id = "container-ad3ffd8815977b191739e3734c05e473";
      adRef2.current.appendChild(container);

      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src =
        "https://walkeralacrityfavorite.com/ad3ffd8815977b191739e3734c05e473/invoke.js?cb=" +
        cb;

      adRef2.current.appendChild(script);
    };

    const loadAds = () => {
      loadAd1();
      setTimeout(loadAd2, 500); // small delay like networks expect
    };

    // first load
    loadAds();

    // check every 10 sec and reload only if empty
    const interval = setInterval(loadAds, 10000);

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
        style={{ maxHeight: 50 }}
      />
      <div
        ref={adRef2}
        className="flex-1 flex justify-center overflow-hidden"
        style={{ maxHeight: 50 }}
      />
    </div>
  );
}