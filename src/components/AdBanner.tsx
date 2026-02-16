import { useEffect, useRef } from "react";

export function AdBanner() {
  const adRef1 = useRef<HTMLDivElement>(null);
  const adRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // -------- Ad 1 --------
    if (adRef1.current && adRef1.current.childElementCount === 0) {
      const container1 = document.createElement("div");

      container1.innerHTML = `
        <script>
          var atOptions = {
            'key' : '1611ca31419bb9c178b7e5a53931edb0',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
          };
        </script>
        <script src="https://www.highperformanceformat.com/1611ca31419bb9c178b7e5a53931edb0/invoke.js"></script>
      `;

      adRef1.current.appendChild(container1);
    }

    // -------- Ad 2 --------
    if (adRef2.current && adRef2.current.childElementCount === 0) {
      const container2 = document.createElement("div");

      container2.innerHTML = `
        <script>
          var atOptions = {
            'key' : '28da3934f715b5b5eccce644d9633aa7',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
          };
        </script>
        <script src="https://www.highperformanceformat.com/28da3934f715b5b5eccce644d9633aa7/invoke.js"></script>
      `;

      adRef2.current.appendChild(container2);
    }
  }, []);

  return (
    <div
      className="w-full flex justify-center items-center gap-4 flex-wrap"
      role="complementary"
      aria-label="Advertisement"
    >
      <div style={{ width: 320, height: 50 }} ref={adRef1} />
      <div style={{ width: 320, height: 50 }} ref={adRef2} />
    </div>
  );
}