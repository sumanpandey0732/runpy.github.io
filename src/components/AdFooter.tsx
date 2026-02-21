import { useEffect, useRef } from "react";

export function AdFooter() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAd1 = () => {
      if (!adRef1.current) return;

      const cb = Date.now();
      // Create a temporary buffer div so the old ad stays visible while this loads
      const newContainer = document.createElement("div");
      newContainer.id = "container-cb676fc5c68bf473009afc5fd084f637";
      
      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src = "https://walkeralacrityfavorite.com/cb676fc5c68bf473009afc5fd084f637/invoke.js?cb=" + cb;

      // Append new script to the new container
      newContainer.appendChild(script);

      // SWAP: Clear old and append new immediately to trigger load
      // To truly prevent vanish, we only clear once the script starts executing
      adRef1.current.innerHTML = ""; 
      adRef1.current.appendChild(newContainer);
    };

    const loadAd2 = () => {
      if (!adRef2.current) return;

      const cb = Date.now();
      const newContainer = document.createElement("div");
      newContainer.id = "container-ad3ffd8815977b191739e3734c05e473";

      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src = "https://walkeralacrityfavorite.com/ad3ffd8815977b191739e3734c05e473/invoke.js?cb=" + cb;

      newContainer.appendChild(script);

      adRef2.current.innerHTML = "";
      adRef2.current.appendChild(newContainer);
    };

    const loadAds = () => {
      loadAd1();
      setTimeout(loadAd2, 500);
    };

    loadAds();

    // 🔥 FORCE reload every 5 sec ALWAYS
    const interval = setInterval(() => {
      loadAds();
    }, 5000);

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
        style={{ minHeight: 50, maxHeight: 50 }} // Added minHeight to prevent collapse
      />
      <div
        ref={adRef2}
        className="flex-1 flex justify-center overflow-hidden"
        style={{ minHeight: 50, maxHeight: 50 }} // Added minHeight to prevent collapse
      />
    </div>
  );
}
