const products = [
  {
    name: "Cabinet Doors",
    slug: "doors-and-drawer-fronts",
    detail: "Made to fit your vision",
    image:
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1000&q=85",
    number: "01",
  },
  {
    name: "Drawer Boxes",
    slug: "drawer-boxes",
    detail: "Built for everyday living",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=85",
    number: "02",
  },
  {
    name: "RTA Cabinets",
    slug: "components",
    detail: "Smart design, ready to assemble",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
    number: "03",
  },
  {
    name: "Finishing & More",
    slug: "finishes",
    detail: "The details make the difference",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
    number: "04",
  },
];

const benefits = [
  {
    icon: "↗",
    title: "On-time, every time",
    text: "Reliable lead times and a promise you can build your business around.",
  },
  {
    icon: "✳",
    title: "Easy to do business",
    text: "Real people, thoughtful support, and a team that knows your name.",
  },
  {
    icon: "⌂",
    title: "Everything in one place",
    text: "A comprehensive range of custom components for the projects you create.",
  },
];

export default function Home() {
  return (
    <main>
      <div className="announcement">
        <span>Built around your business.</span>
        <a href="#products">Discover what we make <span aria-hidden="true">↗</span></a>
      </div>

      <header className="site-header">
        <a className="brand" href="#" aria-label="Decore-ative Specialties home">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span className="brand-name">
            <strong>DECORE-ATIVE</strong>
            <small>SPECIALTIES</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="/products">Products</a>
          <a href="#difference">Why Decore</a>
          <a href="#inspiration">Inspiration</a>
          <a href="/contact-us">Contact</a>
        </nav>

        <div className="header-actions">
          <a className="login-link" href="/contact-us">Log in</a>
          <a className="header-cta" href="/contact-us">Let&apos;s talk <span aria-hidden="true">↗</span></a>
          <details className="mobile-menu">
            <summary aria-label="Open navigation menu"><span></span><span></span></summary>
            <nav aria-label="Mobile navigation">
              <a href="/products">Products</a>
              <a href="#difference">Why Decore</a>
              <a href="#inspiration">Inspiration</a>
              <a href="/contact-us">Contact</a>
            </nav>
          </details>
        </div>
      </header>

      <section className="hero">
        <div className="hero-photo" aria-hidden="true"></div>
        <div className="hero-shade" aria-hidden="true"></div>
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow"><span></span> Your partner in possibility</p>
          <h1>Helping cabinet<br />professionals <em>succeed.</em></h1>
          <p className="hero-copy">
            Custom cabinet components, made with care and delivered with a
            commitment you can count on.
          </p>
          <div className="hero-actions">
            <a className="button button-red" href="#products">Explore our products <span aria-hidden="true">↗</span></a>
            <a className="text-link light-link" href="#difference">Get to know us <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="hero-caption">
          <span>Made for the people who make a difference.</span>
          <span>Custom components <b>—</b> Proudly made in California</span>
        </div>
        <div className="hero-index"><span>01</span><i></i><span>03</span></div>
      </section>

      <section className="benefits" id="difference">
        <div className="section-intro">
          <p className="eyebrow">Good work starts with good people</p>
          <h2>More than parts.<br /><em>A partner.</em></h2>
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

      <section className="products-section" id="products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Thoughtfully made, ready for what&apos;s next</p>
            <h2>Components for<br /><em>every corner.</em></h2>
          </div>
          <a className="text-link" href="/products">View all products <span aria-hidden="true">↗</span></a>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <a
              className="product-card"
              href={`/products#${product.slug}`}
              key={product.name}
            >
              <div
                className="product-image"
                role="img"
                aria-label={`${product.name} in a modern interior`}
                style={{ backgroundImage: `url("${product.image}")` }}
              >
                <span className="product-number">{product.number}</span>
                <span className="product-arrow" aria-hidden="true">↗</span>
              </div>
              <div className="product-info">
                <div><h3>{product.name}</h3><p>{product.detail}</p></div>
                <span aria-hidden="true">↗</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="story-section" id="inspiration">
        <div className="story-image" role="img" aria-label="Warm, modern kitchen with custom cabinetry"></div>
        <div className="story-copy">
          <p className="eyebrow">A little more personal</p>
          <h2>We believe good business is built on <em>good relationships.</em></h2>
          <p>
            For generations, we&apos;ve helped independent cabinet professionals
            bring their best work to life. Your craft deserves a partner who
            cares about every detail.
          </p>
          <a className="button button-dark" href="/contact-us">Our story <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className="contact-banner" id="contact">
        <div>
          <p className="eyebrow">Have a project in mind?</p>
          <h2>Let&apos;s make something<br /><em>worth coming home to.</em></h2>
        </div>
        <a className="button button-light" href="/contact-us">Start a conversation <span aria-hidden="true">↗</span></a>
      </section>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#" aria-label="Decore-ative Specialties home">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span className="brand-name"><strong>DECORE-ATIVE</strong><small>SPECIALTIES</small></span>
        </a>
        <p>Custom components. Considered relationships.</p>
        <span>© Decore-ative Specialties</span>
      </footer>
    </main>
  );
}
