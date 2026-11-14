import Link from "next/link";

export function ProductsHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Appliance Studio home">
        <span className="brand-mark" aria-hidden="true">A</span>
        <span className="brand-name">
          <strong>APPLIANCE</strong>
          <small>STUDIO</small>
        </span>
      </Link>

      <nav className="main-nav" aria-label="Main navigation">
        <Link className="active" href="/products">Appliances</Link>
        <Link href="/#difference">Why us</Link>
        <Link href="/#inspiration">Our promise</Link>
        <Link href="/contact-us">Contact</Link>
      </nav>

      <div className="header-actions">
        <Link className="login-link" href="/contact-us">Contact</Link>
        <Link className="header-cta" href="/contact-us">
          Talk to us <span aria-hidden="true">↗</span>
        </Link>
        <details className="mobile-menu">
          <summary aria-label="Open navigation menu"><span></span><span></span></summary>
          <nav aria-label="Mobile navigation">
            <Link href="/products">Appliances</Link>
            <Link href="/#difference">Why us</Link>
            <Link href="/#inspiration">Our promise</Link>
            <Link href="/contact-us">Contact</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
