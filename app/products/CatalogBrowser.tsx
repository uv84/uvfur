"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Category, Product } from "@/lib/catalog";
import { PriceRequestButton } from "./PriceRequestButton";
import { CategoryDrawer } from "./CategoryDrawer";

type ExploreTopic = {
  id: string;
  title: string;
  text: string;
};

export function CatalogBrowser({
  categories,
  products,
  exploreTopics,
}: {
  categories: Category[];
  products: Product[];
  exploreTopics: ExploreTopic[];
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(
    new Set(),
  );

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) {
      return products;
    }

    const categoryIds = getDescendantCategoryIds(categories, selectedCategoryId);
    return products.filter((product) => categoryIds.has(product.category_id));
  }, [categories, products, selectedCategoryId]);

  function selectCategory(category: Category) {
    setSelectedCategoryId(category.id);
    if (categories.some((item) => item.parent_id === category.id)) {
      setExpandedCategoryIds((current) => new Set(current).add(category.id));
    }
  }

  function toggleCategory(categoryId: string) {
    setExpandedCategoryIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  function showAllProducts() {
    setSelectedCategoryId(null);
    setExpandedCategoryIds(new Set());
  }

  return (
    <>
      <aside className="catalog-sidebar">
        <CategoryDrawer
          categories={categories}
          expandedCategoryIds={expandedCategoryIds}
          onSelect={selectCategory}
          onShowAll={showAllProducts}
          onToggle={toggleCategory}
          selectedCategoryId={selectedCategoryId}
        />
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
          <span className="sidebar-note-mark" aria-hidden="true">A</span>
          <p>Need help choosing?</p>
          <Link href="/contact-us">Talk to our team <span aria-hidden="true">↗</span></Link>
        </div>
      </aside>

      <section className="catalog-main" aria-labelledby="catalog-heading">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">Made for the way you live</p>
            <h2 id="catalog-heading">
              {selectedCategory?.name ?? "Explore"}{" "}
              <em>{selectedCategory ? "products" : "appliances"}</em>
            </h2>
          </div>
          <span>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
          </span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="catalog-grid">
            {filteredProducts.map((product, index) => (
              <article className="catalog-product-card" key={product.id}>
                <Link
                  aria-label={`View ${product.name} details`}
                  className="catalog-product-card-image"
                  href={`/products/${product.slug}`}
                  title={`View ${product.name} details`}
                  style={{ backgroundImage: `url("${product.image_url}")` }}
                >
                  <span className="catalog-card-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
                <div className="catalog-product-card-copy">
                  <p className="catalog-product-category">{product.category_name}</p>
                  <h3>
                    <Link href={`/products/${product.slug}`}>{product.name}</Link>
                  </h3>
                  <p>{product.description}</p>
                  <Link
                    className="catalog-product-details-link"
                    href={`/products/${product.slug}`}
                  >
                    View product details <span aria-hidden="true">↗</span>
                  </Link>
                  <div className="catalog-product-prices">
                    {product.amazon_price !== null && (
                      <span>
                        Retail{" "}
                        <strong>
                          {formatPrice(product.amazon_price)}
                        </strong>
                      </span>
                    )}
                    {product.bosch_price !== null && (
                      <span>
                        Our price{" "}
                        <strong>
                          {formatPrice(product.bosch_price)}
                        </strong>
                      </span>
                    )}
                  </div>
                  <PriceRequestButton
                    productId={product.id}
                    productName={product.name}
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="catalog-empty-state">
            <h3>No products in this category yet</h3>
            <p>Check another category or view all available products.</p>
            <button onClick={showAllProducts} type="button">View all products</button>
          </div>
        )}
      </section>
    </>
  );
}

function getDescendantCategoryIds(categories: Category[], selectedId: string) {
  const descendants = new Set([selectedId]);
  let hasNewDescendants = true;

  while (hasNewDescendants) {
    hasNewDescendants = false;
    for (const category of categories) {
      if (
        category.parent_id &&
        descendants.has(category.parent_id) &&
        !descendants.has(category.id)
      ) {
        descendants.add(category.id);
        hasNewDescendants = true;
      }
    }
  }

  return descendants;
}

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(price));
}
