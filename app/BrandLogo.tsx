import Image from "next/image";

export function BrandLogo({ priority = false }: { priority?: boolean }) {
  return (
    <Image
      alt="Beingstones"
      className="brand-logo"
      height={207}
      priority={priority}
      src="/beingstones-logo.png"
      width={655}
    />
  );
}
