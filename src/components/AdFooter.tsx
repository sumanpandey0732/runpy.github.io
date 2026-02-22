import { useEffect, useRef } from "react";

export function AdFooter() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAds = () => {
      const cb = Date.now();

      const refreshSlot = (ref: React.RefObject<HTMLDivElement>, containerId: string) => {
        if (!ref.current) return;

        // 1. Create the NEW container and script
        const newContainer = document.createElement("div");
        newContainer.id = containerId;
        // Keep it hidden while loading to prevent "doubling" visual glitch
        newContainer.style.position = "absolute";
        newContainer.style.top = "0";
        newContainer.style.opacity = "0";

        const script = document.createElement("script");
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        script.src = `https://walkeralacrityfavorite.com/${containerId.replace('container-', '')}/invoke.js?cb=${cb}`;

        // 2. Put the new ad into the ref (Old ad is still there!)
        ref.current.appendChild(newContainer);
        ref.current.appendChild(script);

        // 3. Wait 2 seconds for the script to fetch the image, THEN swap
        setTimeout(() => {
          if (ref.current) {
            // Find all containers in this slot
            const allContainers = ref.current.querySelectorAll(`[id^="${containerId}"]`);
            
            // If we have more than one, remove the oldest ones and show the newest
            if (allContainers.length > 1) {
              for (let i = 0; i < allContainers.length - 1; i++) {
                allContainers[i].remove();
              }
              // Make the new one visible and positioned normally
              const latest = allContainers[allContainers.length - 1] as HTMLDivElement;
              latest.style.position = "relative";
              latest.style.opacity = "1";
            }
            
            // Cleanup old scripts to keep the browser fast
            const scripts = ref.current.querySelectorAll('script');
            if (scripts.length > 1) {
              scripts[0].remove();
            }
          }
        }, 2000); // 2 second overlap so it NEVER vanishes
      };

      refreshSlot(adRef1, "container-cb676fc5c68bf473009afc5fd084f637");
      refreshSlot(adRef2, "container-ad3ffd8815977b191739e3734c05e473");
    };

    loadAds();
    const interval = setInterval(loadAds, 10000); // 10 Second Reload

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full flex flex-row flex-wrap items-center justify-center gap-2 bg-secondary/40 border-t border-border overflow-hidden"
      style={{ minHeight: "65px", height: "65px" }} // Forced height so it can't vanish
      role="complementary"
    >
      <div
        ref={adRef1}
        className="flex-1 flex justify-center items-center relative"
        style={{ minHeight: "50px", minWidth: "120px" }} // Prevents box from shrinking
      />
      <div
        ref={adRef2}
        className="flex-1 flex justify-center items-center relative"
        style={{ minHeight: "50px", minWidth: "120px" }}
      />
    </div>
  );
}
