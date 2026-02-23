import { useEffect, useRef } from "react";

export function AdFooter() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const forceSize = (el: HTMLDivElement | null) => {
      if (!el) return;

      // force everything inside to be banner size
      const iframes = el.querySelectorAll("iframe");
      iframes.forEach((i) => {
        i.style.height = "50px";
        i.style.maxHeight = "50px";
        i.style.width = "100%";
      });

      const divs = el.querySelectorAll("div");
      divs.forEach((d) => {
        d.style.maxHeight = "50px";
        d.style.overflow = "hidden";
      });
    };

    const loadAds = () => {
      const cb = Date.now();

      // Ad 1
      if (adRef1.current) {
        const container = document.createElement("div");
        container.id = "container-cb676fc5c68bf473009afc5fd084f637";

        const script = document.createElement("script");
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        script.src =
          "https://walkeralacrityfavorite.com/cb676fc5c68bf473009afc5fd084f637/invoke.js?cb=" + cb;

        adRef1.current.innerHTML = "";
        adRef1.current.appendChild(container);
        adRef1.current.appendChild(script);

        // wait ad inject → then force size
        setTimeout(() => forceSize(adRef1.current), 1500);
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

        adRef2.current.innerHTML = "";
        adRef2.current.appendChild(container);
        adRef2.current.appendChild(script);

        setTimeout(() => forceSize(adRef2.current), 1500);
      }
    };

    loadAds();
    const interval = setInterval(loadAds, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full flex flex-row items-center justify-center gap-2 bg-secondary/40 border-t border-border overflow-hidden"
      style={{ height: 60 }}
      role="complementary"
      aria-label="Footer advertisement"
    >
      <div
        ref={adRef1}
        className="flex-1 flex justify-center overflow-hidden"
        style={{ height: 50 }}
      />
      <div
        ref={adRef2}
        className="flex-1 flex justify-center overflow-hidden"
        style={{ height: 50 }}
      />
    </div>
  );
}