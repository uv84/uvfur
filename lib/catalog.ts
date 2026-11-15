import "server-only";

import { neon, NeonDbError } from "@neondatabase/serverless";
import { connection } from "next/server";
import "@/lib/neon";

export type Category = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string;
  image_url: string;
};

export type Product = {
  id: string;
  category_id: string;
  category_name: string;
  category_parent_id: string | null;
  name: string;
  slug: string;
  description: string;
  amazon_price: string | null;
  bosch_price: string | null;
  image_url: string;
};

export type Testimonial = {
  id: string;
  customer_name: string;
  customer_title: string;
  content: string;
};

export type SiteBanner = {
  image_url: string;
  is_active: boolean;
};

export type AdminOverview = {
  enquiryCount: number;
  productCount: number;
  categoryCount: number;
  testimonialCount: number;
  productsByCategory: {
    id: string;
    name: string;
    parent_name: string | null;
    product_count: number;
  }[];
  recentEnquiries: {
    id: string;
    product_name: string;
    full_name: string;
    phone: string;
    email: string;
    created_at: string;
  }[];
};

export class CatalogUnavailableError extends Error {
  constructor(
    public readonly reason: "configuration" | "network" | "schema",
    options?: ErrorOptions,
  ) {
    super(`Catalog is unavailable: ${reason}.`, options);
    this.name = "CatalogUnavailableError";
  }
}

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new CatalogUnavailableError("configuration");
  }

  return neon(databaseUrl);
}

function isNeonNetworkError(error: unknown): error is NeonDbError {
  return error instanceof NeonDbError && error.sourceError?.message === "fetch failed";
}

async function runCatalogQuery<T extends Record<string, unknown>>(
  query: () => Promise<T[]>,
) {
  try {
    return await query();
  } catch (error) {
    if (error instanceof NeonDbError && error.code === "42P01") {
      throw new CatalogUnavailableError("schema");
    }

    if (!isNeonNetworkError(error)) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      return await query();
    } catch (retryError) {
      if (retryError instanceof NeonDbError && retryError.code === "42P01") {
        throw new CatalogUnavailableError("schema");
      }

      if (!isNeonNetworkError(retryError)) {
        throw retryError;
      }

      throw new CatalogUnavailableError("network", { cause: retryError });
    }
  }
}

export async function getCatalogData() {
  await connection();
  const sql = getDatabase();

  const [categoryRows, productRows] = await Promise.all([
    runCatalogQuery(() => sql`
      SELECT id::text, parent_id::text, name, slug, description, image_url
      FROM categories
      ORDER BY sort_order, name
    `),
    runCatalogQuery(() => sql`
      SELECT
        products.id::text,
        products.category_id::text,
        categories.name AS category_name,
        categories.parent_id::text AS category_parent_id,
        products.name,
        products.slug,
        products.description,
        products.amazon_price::text,
        products.bosch_price::text,
        products.image_url
      FROM products
      JOIN categories ON categories.id = products.category_id
      WHERE products.is_active = true
      ORDER BY products.created_at DESC
    `),
  ]);

  const categories: Category[] = categoryRows.map((row) => ({
    id: String(row.id),
    parent_id: row.parent_id === null ? null : String(row.parent_id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description),
    image_url: String(row.image_url),
  }));
  const products: Product[] = productRows.map((row) => ({
    id: String(row.id),
    category_id: String(row.category_id),
    category_name: String(row.category_name),
    category_parent_id:
      row.category_parent_id === null ? null : String(row.category_parent_id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description),
    amazon_price: row.amazon_price === null ? null : String(row.amazon_price),
    bosch_price: row.bosch_price === null ? null : String(row.bosch_price),
    image_url: String(row.image_url),
  }));

  return { categories, products };
}

export async function getTestimonials(): Promise<Testimonial[]> {
  await connection();
  const sql = getDatabase();
  const rows = await runCatalogQuery(() => sql`
    SELECT id::text, customer_name, customer_title, content
    FROM testimonials
    ORDER BY created_at DESC
  `);

  return rows.map((row) => ({
    id: String(row.id),
    customer_name: String(row.customer_name),
    customer_title: String(row.customer_title),
    content: String(row.content),
  }));
}

export async function getSiteBanner(): Promise<SiteBanner | null> {
  await connection();
  const sql = getDatabase();
  const rows = await runCatalogQuery(() => sql`
    SELECT image_url, is_active
    FROM site_banner
    WHERE id = 1
    LIMIT 1
  `);
  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    image_url: String(row.image_url),
    is_active: Boolean(row.is_active),
  };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  await connection();
  const sql = getDatabase();
  const [statRows, categoryRows, enquiryRows] = await Promise.all([
    runCatalogQuery(() => sql`
      SELECT
        (SELECT COUNT(*) FROM price_requests)::text AS enquiry_count,
        (SELECT COUNT(*) FROM products WHERE is_active = true)::text AS product_count,
        (SELECT COUNT(*) FROM categories)::text AS category_count,
        (SELECT COUNT(*) FROM testimonials)::text AS testimonial_count
    `),
    runCatalogQuery(() => sql`
      SELECT
        category.id::text,
        category.name,
        parent.name AS parent_name,
        COUNT(product.id)::text AS product_count
      FROM categories AS category
      LEFT JOIN categories AS parent ON parent.id = category.parent_id
      LEFT JOIN products AS product
        ON product.category_id = category.id AND product.is_active = true
      GROUP BY
        category.id,
        category.name,
        category.parent_id,
        parent.name,
        parent.sort_order,
        category.sort_order
      ORDER BY COALESCE(parent.sort_order, category.sort_order), category.sort_order, category.name
    `),
    runCatalogQuery(() => sql`
      SELECT
        id::text,
        product_name,
        full_name,
        phone,
        email,
        created_at::text
      FROM price_requests
      ORDER BY created_at DESC
      LIMIT 8
    `),
  ]);
  const stats = statRows[0];

  return {
    enquiryCount: Number(stats.enquiry_count),
    productCount: Number(stats.product_count),
    categoryCount: Number(stats.category_count),
    testimonialCount: Number(stats.testimonial_count),
    productsByCategory: categoryRows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      parent_name: row.parent_name === null ? null : String(row.parent_name),
      product_count: Number(row.product_count),
    })),
    recentEnquiries: enquiryRows.map((row) => ({
      id: String(row.id),
      product_name: String(row.product_name),
      full_name: String(row.full_name),
      phone: String(row.phone),
      email: String(row.email),
      created_at: String(row.created_at),
    })),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await connection();
  const sql = getDatabase();
  const rows = await runCatalogQuery(() => sql`
    SELECT
      products.id::text,
      products.category_id::text,
      categories.name AS category_name,
      categories.parent_id::text AS category_parent_id,
      products.name,
      products.slug,
      products.description,
      products.amazon_price::text,
      products.bosch_price::text,
      products.image_url
    FROM products
    JOIN categories ON categories.id = products.category_id
    WHERE products.slug = ${slug}
      AND products.is_active = true
    LIMIT 1
  `);
  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    category_id: String(row.category_id),
    category_name: String(row.category_name),
    category_parent_id:
      row.category_parent_id === null ? null : String(row.category_parent_id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description),
    amazon_price: row.amazon_price === null ? null : String(row.amazon_price),
    bosch_price: row.bosch_price === null ? null : String(row.bosch_price),
    image_url: String(row.image_url),
  };
}
