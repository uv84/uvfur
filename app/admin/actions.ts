"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { neon, NeonDbError } from "@neondatabase/serverless";
import "@/lib/neon";
import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
  isValidAdminPassword,
} from "@/lib/admin-auth";

export type ActionResult = {
  error?: string;
  message?: string;
};

const UUID_PATTERN = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;
const PRICE_PATTERN = /^\d{1,8}(\.\d{1,2})?$/;

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Add your Neon connection string to .env.local first.");
  }

  return neon(databaseUrl);
}

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    throw new Error("Enter a name that can be used to create a URL slug.");
  }

  return slug;
}

function validateImageUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a valid image URL.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Image URLs must use HTTP or HTTPS.");
  }

  return url.toString();
}

function parseImageUrl(formData: FormData) {
  try {
    return { url: validateImageUrl(formText(formData, "imageUrl")) } as const;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Enter a valid image URL.",
    } as const;
  }
}

function optionalPrice(value: string, label: string) {
  if (!value) {
    return null;
  }

  if (!PRICE_PATTERN.test(value)) {
    throw new Error(`${label} must be a number with up to 8 digits and 2 decimals.`);
  }

  return value;
}

function friendlyDbError(error: unknown): ActionResult {
  if (error instanceof NeonDbError) {
    if (error.code === "23505") {
      return { error: "That name is already in use. Choose a different one." };
    }
    if (error.code === "23503") {
      return {
        error:
          "This item is still linked to other records. Delete its products or subcategories first.",
      };
    }
    if (error.code === "42P01") {
      return { error: "Catalog tables are missing. Run db/schema.sql in Neon first." };
    }
  }

  throw error;
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Your admin session has expired. Sign in again.");
  }
}

export async function loginAdmin(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const password = formText(formData, "password");

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return {
      error:
        "Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in .env.local before signing in.",
    };
  }

  if (!isValidAdminPassword(password)) {
    return { error: "The admin password is incorrect." };
  }

  await createAdminSession();
  revalidatePath("/admin");
  return { message: "Signed in." };
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin");
}

export async function saveCategory(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = formText(formData, "id");
  const name = formText(formData, "name");
  const description = formText(formData, "description");
  const image = parseImageUrl(formData);
  const parentId = formText(formData, "parentId");

  if ("error" in image) {
    return { error: image.error };
  }

  const imageUrl = image.url;

  if (!name || name.length > 120) {
    return { error: "Category names must be between 1 and 120 characters." };
  }

  if (description.length > 2000) {
    return { error: "Category descriptions must be 2,000 characters or fewer." };
  }

  if (parentId && !UUID_PATTERN.test(parentId)) {
    return { error: "Choose an existing top-level category." };
  }

  if (id && parentId === id) {
    return { error: "A category cannot be its own parent." };
  }

  const sql = getDatabase();

  try {
    if (parentId) {
      const parents = await sql`
        SELECT id::text FROM categories
        WHERE id = ${parentId}::uuid AND parent_id IS NULL
        LIMIT 1
      `;

      if (parents.length === 0) {
        return { error: "Choose an existing top-level category." };
      }
    }

    const slug = slugify(name);

    if (id) {
      if (!UUID_PATTERN.test(id)) {
        return { error: "Invalid category." };
      }

      await sql`
        UPDATE categories
        SET name = ${name},
            slug = ${slug},
            description = ${description},
            image_url = ${imageUrl},
            parent_id = ${parentId || null}::uuid
        WHERE id = ${id}::uuid
      `;
    } else {
      await sql`
        INSERT INTO categories (name, slug, description, image_url, parent_id)
        VALUES (${name}, ${slug}, ${description}, ${imageUrl}, ${parentId || null}::uuid)
      `;
    }
  } catch (error) {
    return friendlyDbError(error);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  return { message: id ? "Category updated." : "Category added." };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  await requireAdmin();

  if (!UUID_PATTERN.test(categoryId)) {
    return { error: "Invalid category." };
  }

  const sql = getDatabase();

  try {
    await sql`DELETE FROM categories WHERE id = ${categoryId}::uuid`;
  } catch (error) {
    return friendlyDbError(error);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  return { message: "Category deleted." };
}

export async function saveProduct(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = formText(formData, "id");
  const name = formText(formData, "name");
  const description = formText(formData, "description");
  const image = parseImageUrl(formData);
  const categoryId = formText(formData, "categoryId");
  const amazonPrice = optionalPrice(formText(formData, "amazonPrice"), "Retail price");
  const boschPrice = optionalPrice(formText(formData, "boschPrice"), "Our price");

  if ("error" in image) {
    return { error: image.error };
  }

  const imageUrl = image.url;

  if (!name || name.length > 160) {
    return { error: "Product names must be between 1 and 160 characters." };
  }

  if (description.length > 5000) {
    return { error: "Product descriptions must be 5,000 characters or fewer." };
  }

  if (!UUID_PATTERN.test(categoryId)) {
    return { error: "Choose a product category." };
  }

  if (id && !UUID_PATTERN.test(id)) {
    return { error: "Invalid product." };
  }

  const sql = getDatabase();

  try {
    const categories = await sql`
      SELECT id::text FROM categories WHERE id = ${categoryId}::uuid LIMIT 1
    `;

    if (categories.length === 0) {
      return { error: "Choose an existing category or subcategory." };
    }

    const slug = slugify(name);

    if (id) {
      await sql`
        UPDATE products
        SET category_id = ${categoryId}::uuid,
            name = ${name},
            slug = ${slug},
            description = ${description},
            amazon_price = ${amazonPrice}::numeric,
            bosch_price = ${boschPrice}::numeric,
            image_url = ${imageUrl}
        WHERE id = ${id}::uuid
      `;
    } else {
      await sql`
        INSERT INTO products (
          category_id, name, slug, description, amazon_price, bosch_price, image_url
        )
        VALUES (
          ${categoryId}::uuid,
          ${name},
          ${slug},
          ${description},
          ${amazonPrice}::numeric,
          ${boschPrice}::numeric,
          ${imageUrl}
        )
      `;
    }
  } catch (error) {
    return friendlyDbError(error);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  return { message: id ? "Product updated." : "Product added." };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  await requireAdmin();

  if (!UUID_PATTERN.test(productId)) {
    return { error: "Invalid product." };
  }

  const sql = getDatabase();

  try {
    await sql`DELETE FROM products WHERE id = ${productId}::uuid`;
  } catch (error) {
    return friendlyDbError(error);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  return { message: "Product deleted." };
}
