"use client";

import type { Product } from "@/lib/catalog";
import { PriceRequestButton } from "./PriceRequestButton";

export function ProductPricing({
  product,
  compact = false,
  festivalName = "",
  festiveOfferEnabled = false,
}: {
  product: Product;
  compact?: boolean;
  festivalName?: string;
  festiveOfferEnabled?: boolean;
}) {
  return (
    <div
      className={`product-pricing-panel${compact ? " catalog-product-pricing-panel" : ""}`}
    >
      {festiveOfferEnabled && festivalName && (
        <div className="festive-offer-label">
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <path
              d="M5 10h14v11H5zM3 6h18v4H3zm9 0c-5 0-5-5-2-5 2 0 2 5 2 5Zm0 0c0-5 0-5 2-5 3 0 3 5-2 5Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            />
          </svg>
          <strong>{festivalName} Offer</strong>
        </div>
      )}
      <div className="product-prices" aria-label="Product pricing">
        {product.bosch_price !== null && (
          <div className="product-price">
            <strong className="product-price-brand product-price-brand-bosch">
              BOSCH
            </strong>
            <span className="product-price-label">Bosch price</span>
            <strong className="product-price-value">{formatPrice(product.bosch_price)}</strong>
          </div>
        )}
        {product.amazon_price !== null && (
          <div className="product-price">
            <strong className="product-price-brand product-price-brand-amazon">
              amazon
            </strong>
            <span className="product-price-label">Amazon price</span>
            <strong className="product-price-value">{formatPrice(product.amazon_price)}</strong>
          </div>
        )}
        {product.flipkart_price !== null && (
          <div className="product-price">
            <strong className="product-price-brand product-price-brand-flipkart">
              <span>Flipkart</span>
              <span aria-hidden="true" className="product-flipkart-bag">F</span>
            </strong>
            <span className="product-price-label">Flipkart price</span>
            <strong className="product-price-value">{formatPrice(product.flipkart_price)}</strong>
          </div>
        )}
        {product.bosch_price === null &&
          product.amazon_price === null &&
          product.flipkart_price === null && (
            <p className="product-price-empty">
              Contact us for current pricing and availability.
            </p>
          )}
      </div>

      <PriceRequestButton
        productId={product.id}
        productName={product.name}
        variant="featured"
      />
      <p className="product-price-note">
        <svg aria-hidden="true" fill="none" viewBox="0 0 32 32">
          <path
            d="m4 12 5-5 5 2 3-1 6 2 5 4-4 5-4-2-4 4a2 2 0 0 1-3-3l-2 2a2 2 0 0 1-3-3l-1 1a2 2 0 0 1-3-3l2-2-2-1Zm5-5-4 5m18-2 4 3"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
        <span>
          Have a better price in mind? Share it with us, and we&apos;ll do our best to match it!
        </span>
      </p>
    </div>
  );
}

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(price));
}
