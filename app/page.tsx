import { Suspense } from "react";
import Link from "next/link";
import { getCatalogData } from "@/lib/catalog";

const benefits = [
  {
    icon: "↗",
    title: "Made for everyday life",
    text: "Thoughtful features and dependable performance for the moments that matter.",
  },
  {
    icon: "✳",
    title: "A personal touch",
    text: "Real people, thoughtful advice, and help finding the right appliance.",
  },
  {
    icon: "⌂",
    title: "A home for every need",
    text: "Explore washing machines, ovens, dishwashers, and more in one place.",
  },
];

export default function Home() {
  return (
    <main>
      <div className="announcement">
        <span>Better appliances. Better prices.</span>
        <a href="#products">Discover our collection <span aria-hidden="true">↗</span></a>
      </div>

      <header className="site-header">
        <Link className="brand" href="/" aria-label="Appliance Studio home">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span className="brand-name">
            <strong>APPLIANCE</strong>
            <small>STUDIO</small>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="/products">Products</a>
          <a href="#difference">Why us</a>
          <a href="#inspiration">Our promise</a>
          <a href="/contact-us">Contact</a>
        </nav>

        <div className="header-actions">
          <a className="login-link" href="/contact-us">Contact</a>
          <a className="header-cta" href="/contact-us">Talk to us <span aria-hidden="true">↗</span></a>
          <details className="mobile-menu">
            <summary aria-label="Open navigation menu"><span></span><span></span></summary>
            <nav aria-label="Mobile navigation">
              <a href="/products">Products</a>
              <a href="#difference">Why us</a>
              <a href="#inspiration">Our promise</a>
              <a href="/contact-us">Contact</a>
            </nav>
          </details>
        </div>
      </header>

      <section className="hero">
        <div className="hero-photo" aria-hidden="true"></div>
        <div className="hero-shade" aria-hidden="true"></div>
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow"><span></span> Thoughtful technology for your home</p>
          <h1>Make everyday<br />feel a little <em>better.</em></h1>
          <p className="hero-copy">
            Discover Bosch home appliances chosen for their design, performance,
            and the little details that make life easier.
          </p>
          <div className="hero-actions">
            <a className="button button-red" href="#products">Explore appliances <span aria-hidden="true">↗</span></a>
            <a className="text-link light-link" href="#difference">Why shop with us <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="hero-caption">
          <span>Feel at home with the right appliance.</span>
          <span>Thoughtful design <b>—</b> Personal service</span>
        </div>
        <div className="hero-index"><span>01</span><i></i><span>03</span></div>
      </section>

      <section className="benefits" id="difference">
        <div className="section-intro">
          <p className="eyebrow">Good homes start with good choices</p>
          <h2>More than appliances.<br /><em>A little more care.</em></h2>
        </div>
        <div className="benefit-list">
          {benefits.map((benefit) => (
            <article className="benefit" key={benefit.title}>
              <span className="benefit-icon" aria-hidden="true">{benefit.icon}</span>
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Suspense fallback={<section className="products-section" id="products"><p>Loading products...</p></section>}>
        <HomeCatalogSection />
      </Suspense>

      <section className="story-section" id="inspiration">
        <div className="story-image" role="img" aria-label="Warm, modern kitchen with home appliances"></div>
        <div className="story-copy">
          <p className="eyebrow">A little more personal</p>
          <h2>Great appliances deserve <em>great service.</em></h2>
          <p>
            From comparing features to asking for your best price, our team is
            ready to help you choose the right appliance for your home.
          </p>
          <a className="button button-dark" href="/contact-us">Talk to our team <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className="contact-banner" id="contact">
        <div>
          <p className="eyebrow">Looking for a better price?</p>
          <h2>Let&apos;s find the right fit<br /><em>for your home.</em></h2>
        </div>
        <a className="button button-light" href="/products">Browse appliances <span aria-hidden="true">↗</span></a>
      </section>

      <footer className="site-footer">
        <Link className="brand footer-brand" href="/" aria-label="Appliance Studio home">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span className="brand-name"><strong>APPLIANCE</strong><small>STUDIO</small></span>
        </Link>
        <p>Better appliances. Personal service.</p>
        <span>Independent retailer; not affiliated with Bosch.</span>
      </footer>
    </main>
  );
}

async function HomeCatalogSection() {
  const { categories } = await getCatalogData();
  const products = categories.filter((category) => !category.parent_id).slice(0, 4);

  return (
    <section className="products-section" id="products">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Thoughtfully made, ready for your home</p>
          <h2>Appliances for<br /><em>everyday living.</em></h2>
        </div>
        <a className="text-link" href="/products">View all products <span aria-hidden="true">↗</span></a>
      </div>
      <div className="product-grid">
        {products.map((product, index) => (
          <a
            className="product-card"
            href={`/products#${product.id}`}
            key={product.name}
          >
            <div
              className="product-image"
              role="img"
              aria-label={product.name}
              style={{ backgroundImage: `url("${product.image_url}")` }}
            >
              <span className="product-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="product-arrow" aria-hidden="true">↗</span>
            </div>
            <div className="product-info">
              <div><h3>{product.name}</h3><p>{product.description}</p></div>
              <span aria-hidden="true">↗</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
