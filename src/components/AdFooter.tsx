import { useEffect, useRef } from "react";

export function AdFooter() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAds = () => {
      const cb = Date.now(); // cache buster so ad reloads every time

      // Ad 1
      if (adRef1.current) {
        const container = document.createElement("div");
        container.id = "container-cb676fc5c68bf473009afc5fd084f637";

        const script = document.createElement("script");
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        script.src =
          "https://walkeralacrityfavorite.com/cb676fc5c68bf473009afc5fd084f637/invoke.js?cb=" + cb;

        // Clear and append at the same time to prevent the "vanish" gap
        adRef1.current.innerHTML = "";
        adRef1.current.appendChild(container);
        adRef1.current.appendChild(script);
      }

      // Ad 2
      if (adRef2.current) {
        const container = document.createElement("div");
        container.id = "container-ad3ffd8815977b191739e3734c05e473";

        const script = document.createElement("script");
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        script.src =
          "https://walkeralacrityfavorite.com/ad3ffd8815977b191739e3734c05e473/invoke.js?cb=" + cb;

        // Clear and append at the same time to prevent the "vanish" gap
        adRef2.current.innerHTML = "";
        adRef2.current.appendChild(container);
        adRef2.current.appendChild(script);
      }
    };

    // first load
    loadAds();

    // reload every 10 sec (always)
    const interval = setInterval(loadAds, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full flex flex-row flex-wrap items-center justify-center gap-2 bg-secondary/40 border-t border-border overflow-hidden"
      style={{ minHeight: 60, maxHeight: 60 }}
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
