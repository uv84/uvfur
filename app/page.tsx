import { Suspense } from "react";
import Link from "next/link";
import { getCatalogData, getTestimonials } from "@/lib/catalog";
import { BrandLogo } from "./BrandLogo";
import { HeroCarousel } from "./HeroCarousel";

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
        <Link className="brand" href="/" aria-label="Beingstones home">
          <BrandLogo priority />
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/products">Products</Link>
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
              <Link href="/products">Products</Link>
              <a href="#difference">Why us</a>
              <a href="#inspiration">Our promise</a>
              <a href="/contact-us">Contact</a>
            </nav>
          </details>
        </div>
      </header>

      <section className="hero">
        <HeroCarousel />
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

      <Suspense fallback={<section className="testimonials-section"><p>Loading testimonials...</p></section>}>
        <HomeTestimonialsSection />
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
        <Link className="button button-light" href="/products">Browse appliances <span aria-hidden="true">↗</span></Link>
      </section>

      <footer className="site-footer">
        <Link className="brand footer-brand" href="/" aria-label="Beingstones home">
          <BrandLogo />
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
        <Link className="text-link" href="/products">View all products <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="product-grid">
        {products.map((product, index) => (
          <Link
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
          </Link>
        ))}
      </div>
    </section>
  );
}

async function HomeTestimonialsSection() {
  const testimonials = await getTestimonials();

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-heading">
        <p className="eyebrow">Good words from our customers</p>
        <h2>Made better by <em>you.</em></h2>
        <p>Hear from people who found the right fit for their home with our team.</p>
      </div>
      <div className="testimonial-grid">
        {testimonials.map((testimonial) => (
          <article className="testimonial-card" key={testimonial.id}>
            <span className="testimonial-quote-mark" aria-hidden="true">“</span>
            <blockquote>{testimonial.content}</blockquote>
            <div className="testimonial-author">
              <strong>{testimonial.customer_name}</strong>
              {testimonial.customer_title && <span>{testimonial.customer_title}</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
