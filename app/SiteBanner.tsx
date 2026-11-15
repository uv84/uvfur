import type { SiteBanner as SiteBannerData } from "@/lib/catalog";

export function SiteBanner({ banner }: { banner: SiteBannerData | null }) {
  if (!banner?.is_active) {
    return null;
  }

  return (
    <section className="site-banner" aria-label="Store banner">
      <div
        className="site-banner-image"
        role="img"
        aria-label="Promotional banner"
        style={{ backgroundImage: `url("${banner.image_url}")` }}
      />
    </section>
  );
}
