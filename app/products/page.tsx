import type { Metadata } from "next";
import Link from "next/link";
import "./products.css";

export const metadata: Metadata = {
  title: "Products | Decore-ative Specialties",
  description:
    "Explore custom cabinet doors, drawer boxes, components, molding, hardware, and finishing details for your next project.",
};

const categories = [
  {
    id: "doors-and-drawer-fronts",
    name: "Doors & Drawer Fronts",
    description:
      "Find a look that feels like yours with custom sizes, profiles, materials, and finishes.",
    image:
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1000&q=85",
    number: "01",
  },
  {
    id: "drawer-boxes",
    name: "Drawer Boxes",
    description:
      "Thoughtfully built drawer boxes bring dependable function to the spaces you use every day.",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=85",
    number: "02",
  },
  {
    id: "specialty-items",
    name: "Specialty Items",
    description:
      "Distinctive, made-to-fit details help bring a one-of-a-kind design together.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
    number: "03",
  },
  {
    id: "components",
    name: "Cabinet Components",
    description:
      "Explore the building blocks for cabinetry designed around your project.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
    number: "04",
  },
  {
    id: "molding",
    name: "Molding",
    description:
      "Bring a polished finish to your space with details that frame the whole design.",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
    number: "05",
  },
  {
    id: "accessories",
    name: "Accessories",
    description:
      "Add useful finishing touches that make a room feel considered and complete.",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85",
    number: "06",
  },
  {
    id: "hardware",
    name: "Hardware",
    description:
      "Explore the functional details that add the final touch to cabinetry.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
    number: "07",
  },
];

const exploreTopics = [
  {
    id: "materials",
    title: "Materials",
    text: "Discover a range of materials to suit the style and needs of your project.",
  },
  {
    id: "finishes",
    title: "Finishes",
    text: "Bring your design to life with colors, textures, and finishing options.",
  },
  {
    id: "design-styles",
    title: "Design styles",
    text: "Find inspiration for a look that feels at home in your space.",
  },
  {
    id: "decore-brands",
    title: "Decore brands",
    text: "Get to know the collections and capabilities behind our products.",
  },
];

export default function ProductsPage() {
  return (
    <main className="products-page">
      <div className="announcement">
        <span>Built around your business.</span>
        <Link href="/contact-us">Talk with our team <span aria-hidden="true">↗</span></Link>
      </div>

      <header className="site-header">
        <Link className="brand" href="/" aria-label="Decore-ative Specialties home">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span className="brand-name">
            <strong>DECORE-ATIVE</strong>
            <small>SPECIALTIES</small>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          <Link className="active" href="/products">Products</Link>
          <Link href="/#difference">Why Decore</Link>
          <Link href="/#inspiration">Inspiration</Link>
          <Link href="/contact-us">Contact</Link>
        </nav>

        <div className="header-actions">
          <Link className="login-link" href="/contact-us">Log in</Link>
          <Link className="header-cta" href="/contact-us">Let&apos;s talk <span aria-hidden="true">↗</span></Link>
          <details className="mobile-menu">
            <summary aria-label="Open navigation menu"><span></span><span></span></summary>
            <nav aria-label="Mobile navigation">
              <Link href="/products">Products</Link>
              <Link href="/#difference">Why Decore</Link>
              <Link href="/#inspiration">Inspiration</Link>
              <Link href="/contact-us">Contact</Link>
            </nav>
          </details>
        </div>
      </header>

      <div className="products-breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>Products</span>
      </div>

      <section className="catalog-intro">
        <p className="eyebrow">Made for your next project</p>
        <h1>Products for<br /><em>every possibility.</em></h1>
        <p>
          From the details you notice to the pieces that make it all work,
          explore cabinetry products made to support your vision.
        </p>
      </section>

      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <div className="catalog-side-group">
            <h2>Categories</h2>
            <nav aria-label="Product categories">
              {categories.map((category) => (
                <a href={`#${category.id}`} key={category.id}>
                  <span>{category.name}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </nav>
          </div>
          <div className="catalog-side-group explore-group">
            <h2>Explore</h2>
            <nav aria-label="Product information">
              {exploreTopics.map((topic) => (
                <a href={`#${topic.id}`} key={topic.id}>
                  <span>{topic.title}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </nav>
          </div>
          <div className="sidebar-note">
            <span className="sidebar-note-mark" aria-hidden="true">D</span>
            <p>Have a project in mind?</p>
            <Link href="/contact-us">Let&apos;s talk <span aria-hidden="true">↗</span></Link>
          </div>
        </aside>

        <section className="catalog-main" aria-labelledby="catalog-heading">
          <div className="catalog-heading">
            <div>
              <p className="eyebrow">Find your starting point</p>
              <h2 id="catalog-heading">Explore our <em>products</em></h2>
            </div>
            <span>{categories.length} product categories</span>
          </div>

          <div className="catalog-grid">
            {categories.map((category) => (
              <article className="catalog-card" id={category.id} key={category.id}>
                <div
                  className="catalog-card-image"
                  role="img"
                  aria-label={`${category.name} in a warm, modern interior`}
                  style={{ backgroundImage: `url("${category.image}")` }}
                >
                  <span className="catalog-card-number">{category.number}</span>
                  <span className="catalog-card-image-mark" aria-hidden="true">D</span>
                </div>
                <div className="catalog-card-copy">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <Link href="/contact-us">
                    Ask us about this <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="explore-section" aria-labelledby="explore-heading">
        <div className="explore-heading">
          <p className="eyebrow">Make it your own</p>
          <h2 id="explore-heading">Details shape the <em>whole story.</em></h2>
          <p>Get to know the materials, finishes, and design ideas that make your project yours.</p>
        </div>
        <div className="explore-grid">
          {exploreTopics.map((topic, index) => (
            <article className="explore-card" id={topic.id} key={topic.id}>
              <span className="explore-number">0{index + 1}</span>
              <h3>{topic.title}</h3>
              <p>{topic.text}</p>
              <Link href="/contact-us">Learn more <span aria-hidden="true">↗</span></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="products-cta">
        <div>
          <p className="eyebrow">A helpful team is just a conversation away</p>
          <h2>Let&apos;s make room<br /><em>for what&apos;s next.</em></h2>
        </div>
        <Link className="button button-light" href="/contact-us">
          Get in touch <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <footer className="site-footer">
        <Link className="brand footer-brand" href="/" aria-label="Decore-ative Specialties home">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span className="brand-name"><strong>DECORE-ATIVE</strong><small>SPECIALTIES</small></span>
        </Link>
        <p>Custom components. Considered relationships.</p>
        <span>© Decore-ative Specialties</span>
      </footer>
    </main>
  );
}
