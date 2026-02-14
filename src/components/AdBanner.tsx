export function AdBanner() {
  return (
    <div
      id="ad-banner"
      className="w-full bg-secondary/50 border-b border-border flex items-center justify-center"
      style={{ height: 60 }}
      role="complementary"
      aria-label="Advertisement"
    >
      {/* Replace this placeholder with your AdSense snippet for production */}
      <span className="text-xs text-muted-foreground/50 tracking-widest uppercase">Ad Space</span>
    </div>
  );
}
