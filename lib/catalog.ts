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
