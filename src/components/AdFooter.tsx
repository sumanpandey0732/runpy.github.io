import { useEffect, useRef } from "react";

export function AdFooter() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAds = () => {
      const cb = Date.now();

      const refreshSlot = (ref: React.RefObject<HTMLDivElement>, containerId: string) => {
        if (!ref.current) return;

        // 1. Find the old ad container
        const oldContainer = ref.current.querySelector(`#${containerId}`);
        
        // 2. If it exists, change its ID so the new script doesn't get confused
        if (oldContainer) {
          oldContainer.id = `${containerId}-old`;
        }

        // 3. Create the new container with the required ID
        const newContainer = document.createElement("div");
        newContainer.id = containerId;

        const script = document.createElement("script");
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        script.src = `https://walkeralacrityfavorite.com/${containerId.replace('container-', '')}/invoke.js?cb=${cb}`;

        // 4. Add the new ad to the DOM (the old one is still visible!)
        ref.current.appendChild(newContainer);
        ref.current.appendChild(script);

        // 5. Wait 3 seconds for the new ad to actually download, then remove the old one
        setTimeout(() => {
          const oldOne = ref.current?.querySelector(`#${containerId}-old`);
          const scripts = ref.current?.querySelectorAll('script');
          
          // Remove the old container
          if (oldOne) oldOne.remove();
          
          // Cleanup old scripts so the DOM doesn't get bloated
          if (scripts && scripts.length > 2) {
            scripts[0].remove(); 
          }
        }, 3000);
      };

      refreshSlot(adRef1, "container-cb676fc5c68bf473009afc5fd084f637");
      refreshSlot(adRef2, "container-ad3ffd8815977b191739e3734c05e473");
    };

    loadAds();
    const interval = setInterval(loadAds, 10000); // 10 Seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full flex flex-row flex-wrap items-center justify-center gap-2 bg-secondary/40 border-t border-border overflow-hidden"
      style={{ minHeight: 60, maxHeight: 70 }}
      role="complementary"
    >
      <div
        ref={adRef1}
        className="flex-1 flex justify-center items-center overflow-hidden relative"
        style={{ height: 50 }}
      />
      <div
        ref={adRef2}
        className="flex-1 flex justify-center items-center overflow-hidden relative"
        style={{ height: 50 }}
      />
    </div>
  );
}
