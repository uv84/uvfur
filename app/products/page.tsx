import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getCatalogData, getSiteBanner } from "@/lib/catalog";
import { BrandLogo } from "../BrandLogo";
import { CatalogBrowser } from "./CatalogBrowser";
import { ProductsHeader } from "./ProductsHeader";
import { SiteBanner } from "../SiteBanner";
import "./products.css";

export const metadata: Metadata = {
  title: "Home Appliances | Appliance Studio",
  description:
    "Explore Bosch washing machines, ovens, dishwashers, and refrigerators. Ask our team for your best price.",
};

const exploreTopics = [
  {
    id: "delivery",
    title: "Delivery",
    text: "Ask about delivery options and availability for your area.",
  },
  {
    id: "installation",
    title: "Installation",
    text: "Get help choosing installation support for your new appliance.",
  },
  {
    id: "warranty",
    title: "Warranty",
    text: "Talk with our team about product warranty and care.",
  },
  {
    id: "support",
    title: "After-sales support",
    text: "We are here to help with product questions after your purchase.",
  },
];

export default function ProductsPage() {
  return (
    <Suspense fallback={<main className="products-page"><p className="catalog-loading">Loading catalog...</p></main>}>
      <ProductsContent />
    </Suspense>
  );
}

async function ProductsContent() {
  const [{ categories, products }, banner] = await Promise.all([
    getCatalogData(),
    getSiteBanner(),
  ]);

  return (
    <main className="products-page">
      <div className="announcement">
        <span>Better appliances. Better prices.</span>
        <Link href="/contact-us">Talk with our team <span aria-hidden="true">↗</span></Link>
      </div>

      <ProductsHeader />

      <SiteBanner banner={banner} />

      <div className="products-breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>Products</span>
      </div>

      <section className="catalog-intro">
        <p className="eyebrow">Thoughtful technology. Everyday comfort.</p>
        <h1>Find your next<br /><em>home essential.</em></h1>
        <p>
          Explore Bosch appliances for cooking, cleaning, and caring for your
          home. Ask us for a better price on the products you love.
        </p>
      </section>

      <div className="catalog-layout">
        <CatalogBrowser
          categories={categories}
          products={products}
          exploreTopics={exploreTopics}
        />
      </div>

      <section className="explore-section" aria-labelledby="explore-heading">
        <div className="explore-heading">
          <p className="eyebrow">Make it your own</p>
          <h2 id="explore-heading">Thoughtful care at <em>every step.</em></h2>
          <p>From delivery to after-sales support, our team is here to make your experience easy.</p>
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
          <h2>Make yourself<br /><em>at home.</em></h2>
        </div>
        <Link className="button button-light" href="/contact-us">
          Get in touch <span aria-hidden="true">↗</span>
        </Link>
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
