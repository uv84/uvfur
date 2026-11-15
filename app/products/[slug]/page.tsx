import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getSiteBanner } from "@/lib/catalog";
import { ProductPricing } from "../ProductPricing";
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
  const [product, banner] = await Promise.all([
    getProductBySlug(slug),
    getSiteBanner(),
  ]);

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

          <ProductPricing
            festivalName={banner?.festival_name ?? ""}
            festiveOfferEnabled={banner?.is_festive_offer ?? false}
            product={product}
          />

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
