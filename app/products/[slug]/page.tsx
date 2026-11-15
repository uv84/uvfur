import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog";
import { PriceRequestButton } from "../PriceRequestButton";
import { BrandLogo } from "../../BrandLogo";
import { ProductsHeader } from "../ProductsHeader";
import "../products.css";

export const metadata: Metadata = {
  title: "Product details | Appliance Studio",
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="products-page">
          <p className="catalog-loading">Loading product details...</p>
        </main>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}

async function ProductDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="products-page product-detail-page">
      <div className="announcement">
        <span>Better appliances. Better prices.</span>
        <Link href="/contact-us">Talk with our team <span aria-hidden="true">↗</span></Link>
      </div>
      <ProductsHeader />

      <nav aria-label="Breadcrumb" className="products-breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/products">Products</Link>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </nav>

      <section className="product-detail">
        <div
          aria-label={product.name}
          className="product-detail-image"
          role="img"
          style={{ backgroundImage: `url("${product.image_url}")` }}
        />
        <div className="product-detail-copy">
          <p className="product-detail-category">{product.category_name}</p>
          <h1>{product.name}</h1>
          <p className="product-detail-description">{product.description}</p>

          <div className="product-detail-prices" aria-label="Product pricing">
            {product.bosch_price !== null && (
              <div>
                <span>Bosch price</span>
                <strong>{formatPrice(product.bosch_price)}</strong>
              </div>
            )}
            {product.amazon_price !== null && (
              <div>
                <span>Amazon price</span>
                <strong>{formatPrice(product.amazon_price)}</strong>
              </div>
            )}
            {product.amazon_price === null && product.bosch_price === null && (
              <p>Contact us for current pricing and availability.</p>
            )}
          </div>

          <PriceRequestButton
            productId={product.id}
            productName={product.name}
          />
          <p className="product-detail-note">
            Ask our team about delivery, installation, and product availability.
          </p>
          <Link className="product-detail-back" href="/products">
            <span aria-hidden="true">←</span> Back to all products
          </Link>
        </div>
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

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(price));
}
