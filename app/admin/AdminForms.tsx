"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  deleteCategory,
  deleteProduct,
  loginAdmin,
  logoutAdmin,
  saveCategory,
  saveProduct,
  type ActionResult,
} from "./actions";
import type { Category, Product } from "@/lib/catalog";

const initialState: ActionResult = {};
const NEW_ITEM = "new";

type Selection = { kind: "product" | "category"; id: string } | null;

function FormFeedback({ state }: { state: ActionResult }) {
  if (!state.error && !state.message) {
    return null;
  }

  return (
    <p className={state.error ? "admin-feedback admin-error" : "admin-feedback"} role={state.error ? "alert" : "status"}>
      {state.error ?? state.message}
    </p>
  );
}

function formatPrice(value: string | null) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function ImageField({
  defaultUrl,
  cloudName,
  uploadPreset,
}: {
  defaultUrl: string;
  cloudName?: string;
  uploadPreset?: string;
}) {
  const [url, setUrl] = useState(defaultUrl);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cloudinaryReady = Boolean(cloudName && uploadPreset);

  async function handleFile(file: File | undefined) {
    if (!file || !cloudinaryReady) {
      return;
    }

    setStatus("uploading");
    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", uploadPreset as string);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body },
      );
      const payload = await response.json();

      if (!response.ok || !payload.secure_url) {
        throw new Error(payload.error?.message ?? "Upload failed.");
      }

      setUrl(payload.secure_url);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="admin-image-field">
      <div className="admin-image-preview" style={url ? { backgroundImage: `url("${url}")` } : undefined}>
        {!url && <span>No image</span>}
      </div>
      <div className="admin-image-controls">
        <input name="imageUrl" type="hidden" value={url} />
        <input
          accept="image/*"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
          ref={fileInputRef}
          style={{ display: "none" }}
          type="file"
        />
        <button
          className="admin-upload-button"
          disabled={!cloudinaryReady || status === "uploading"}
          onClick={() => fileInputRef.current?.click()}
          title={
            cloudinaryReady
              ? "Upload image to Cloudinary"
              : "Set the Cloudinary env vars in .env.local"
          }
          type="button"
        >
          {status === "uploading" ? "Uploading..." : url ? "Change image" : "Upload image"}
        </button>
        {status === "error" && (
          <span className="admin-upload-error">Upload failed. Check your Cloudinary settings.</span>
        )}
        {!cloudinaryReady && (
          <span className="admin-upload-hint">Cloudinary not configured — set the env vars in .env.local.</span>
        )}
      </div>
    </div>
  );
}

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);

  return (
    <form className="admin-form admin-login-form" action={formAction}>
      <label>
        Admin password
        <input autoComplete="current-password" name="password" required type="password" />
      </label>
      <FormFeedback state={state} />
      <button disabled={pending} type="submit">{pending ? "Signing in..." : "Sign in"}</button>
    </form>
  );
}

export function AdminDashboard({
  categories,
  products,
  cloudinaryCloudName,
  cloudinaryUploadPreset,
}: {
  categories: Category[];
  products: Product[];
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
}) {
  const [selection, setSelection] = useState<Selection>({ kind: "product", id: NEW_ITEM });
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [notice, setNotice] = useState<ActionResult>({});
  const [isDeleting, startDelete] = useTransition();

  const [productState, productAction, productPending] = useActionState(saveProduct, initialState);
  const [categoryState, categoryAction, categoryPending] = useActionState(saveCategory, initialState);

  const editingProduct =
    selection?.kind === "product" && selection.id !== NEW_ITEM
      ? products.find((product) => product.id === selection.id) ?? null
      : null;
  const editingCategory =
    selection?.kind === "category" && selection.id !== NEW_ITEM
      ? categories.find((category) => category.id === selection.id) ?? null
      : null;
  const isNewProduct = selection?.kind === "product" && selection.id === NEW_ITEM;
  const isNewCategory = selection?.kind === "category" && selection.id === NEW_ITEM;

  const parentCategories = categories.filter(
    (category) => !category.parent_id && category.id !== editingCategory?.id,
  );
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
  const selectionKey = selection ? `${selection.kind}-${selection.id}` : "none";

  useEffect(() => {
    if (productState.message) {
      setFormKey((key) => key + 1);
      setNotice(productState);
    }
  }, [productState]);

  useEffect(() => {
    if (categoryState.message) {
      setFormKey((key) => key + 1);
      setNotice(categoryState);
    }
  }, [categoryState]);

  function select(item: Selection) {
    setSelection(item);
    setNotice({});

    if (item?.kind !== "product" || item.id === NEW_ITEM) {
      setSelectedParentCategoryId("");
      setSelectedSubcategoryId("");
      return;
    }

    const product = products.find((entry) => entry.id === item.id);
    if (product?.category_parent_id) {
      setSelectedParentCategoryId(product.category_parent_id);
      setSelectedSubcategoryId(product.category_id);
    } else {
      setSelectedParentCategoryId(product?.category_id ?? "");
      setSelectedSubcategoryId("");
    }
  }

  function runDelete(action: (id: string) => Promise<ActionResult>, id: string) {
    setNotice({});
    startDelete(async () => {
      const result = await action(id);
      setNotice(result);
      if (result.message && selection?.id === id) {
        setSelection(null);
      }
    });
  }

  return (
    <div className="admin-workspace">
      <header className="admin-workspace-header">
        <div className="admin-workspace-title">
          <Link className="admin-back-link" href="/" aria-label="Back to home">←</Link>
          <div>
            <h1>
              {selection?.kind === "category"
                ? editingCategory ? "Edit Category" : "Add New Category"
                : editingProduct ? "Edit Product" : "Add New Product"}
            </h1>
            <p>Catalog management <span aria-hidden="true">/</span> {selection?.kind === "category" ? "Categories" : "Products"}</p>
          </div>
        </div>
        <div className="admin-header-actions">
          <form action={logoutAdmin}>
            <button className="admin-logout" type="submit">Sign out</button>
          </form>
          {selection?.kind === "product" && (
            <button className="admin-publish-button" disabled={productPending} form="product-form" type="submit">
              {productPending ? "Saving..." : editingProduct ? "Save changes" : "Publish product"}
            </button>
          )}
        </div>
      </header>

      {(notice.error || notice.message) && (
        <p className={notice.error ? "admin-feedback admin-error" : "admin-feedback"} role={notice.error ? "alert" : "status"}>
          {notice.error ?? notice.message}
        </p>
      )}

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <nav className="admin-panel admin-navigation" aria-label="Admin navigation">
            <Link className="admin-nav-action" href="/">
              <span aria-hidden="true">⌂</span> Home
            </Link>
            <button
              className={`admin-nav-action ${selection?.kind === "product" ? "is-active" : ""}`}
              onClick={() => select({ kind: "product", id: NEW_ITEM })}
              type="button"
            >
              <span aria-hidden="true">▧</span> Products
              <span className="admin-nav-count">{products.length}</span>
            </button>
            <button
              className={`admin-nav-action ${selection?.kind === "category" ? "is-active" : ""}`}
              onClick={() => select({ kind: "category", id: NEW_ITEM })}
              type="button"
            >
              <span aria-hidden="true">▦</span> Add category
              <span className="admin-nav-add" aria-hidden="true">+</span>
            </button>
          </nav>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>Products</h2>
              <button
                className={isNewProduct ? "is-active" : ""}
                onClick={() => select({ kind: "product", id: NEW_ITEM })}
                type="button"
              >
                + Add
              </button>
            </div>
            {products.length === 0 ? (
              <p className="admin-empty">No products yet.</p>
            ) : (
              <ul className="admin-nav-list">
                {products.map((product) => (
                  <li key={product.id}>
                    <button
                      className={selection?.kind === "product" && selection.id === product.id ? "is-active" : ""}
                      onClick={() => select({ kind: "product", id: product.id })}
                      type="button"
                    >
                      <span className="admin-nav-thumb" style={{ backgroundImage: `url("${product.image_url}")` }} />
                      <span className="admin-nav-info">
                        <strong>{product.name}</strong>
                        <span>{categoryNameById.get(product.category_id) ?? "Uncategorized"}</span>
                      </span>
                    </button>
                    <button
                      className="admin-nav-delete"
                      disabled={isDeleting}
                      onClick={() => {
                        if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
                          runDelete(deleteProduct, product.id);
                        }
                      }}
                      title="Delete product"
                      type="button"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>Categories</h2>
              <button
                className={isNewCategory ? "is-active" : ""}
                onClick={() => select({ kind: "category", id: NEW_ITEM })}
                type="button"
              >
                + Add
              </button>
            </div>
            {categories.length === 0 ? (
              <p className="admin-empty">No categories yet.</p>
            ) : (
              <ul className="admin-nav-list">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      className={selection?.kind === "category" && selection.id === category.id ? "is-active" : ""}
                      onClick={() => select({ kind: "category", id: category.id })}
                      type="button"
                    >
                      <span className="admin-nav-info">
                        <strong>{category.parent_id ? "↳ " : ""}{category.name}</strong>
                        <span>{category.parent_id ? "Subcategory" : "Category"}</span>
                      </span>
                    </button>
                    <button
                      className="admin-nav-delete"
                      disabled={isDeleting}
                      onClick={() => {
                        if (window.confirm(`Delete "${category.name}" and its subcategories?`)) {
                          runDelete(deleteCategory, category.id);
                        }
                      }}
                      title="Delete category"
                      type="button"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        <div className="admin-main">
          {!selection ? (
            <section className="admin-panel admin-placeholder">
              <p className="eyebrow">Catalog management</p>
              <h2>Select an item to edit.</h2>
              <p className="admin-panel-hint">Choose a product or category from the left panel, or add a new item.</p>
            </section>
          ) : selection.kind === "product" ? (
            <form
              id="product-form"
              key={`${selectionKey}-${formKey}`}
              action={productAction}
              className="admin-form admin-product-form"
            >
              {editingProduct && <input name="id" type="hidden" value={editingProduct.id} />}
              <input
                name="categoryId"
                type="hidden"
                value={selectedSubcategoryId || selectedParentCategoryId}
              />
              <div className="admin-product-editor">
                <div className="admin-product-side-column">
                  <section className="admin-panel admin-media-panel">
                    <div className="admin-section-heading">
                      <div>
                        <h2>Product images</h2>
                        <p>Add a clear image to help customers recognize your product.</p>
                      </div>
                      <span className="admin-status-chip">Cover</span>
                    </div>
                    <ImageField
                      cloudName={cloudinaryCloudName}
                      defaultUrl={editingProduct?.image_url ?? ""}
                      uploadPreset={cloudinaryUploadPreset}
                    />
                  </section>

                  <section className="admin-panel admin-info-card">
                    <h2>Visibility</h2>
                    <p>Published products are visible in your customer catalog.</p>
                    <span className="admin-visible-status"><i aria-hidden="true" /> Visible when published</span>
                  </section>

                  <section className="admin-panel admin-info-card">
                    <h2>Preview</h2>
                    <p>Check how your product appears in the customer catalog.</p>
                    <Link className="admin-preview-link" href="/products">View catalog</Link>
                  </section>
                </div>

                <section className="admin-panel admin-details-panel">
                  <div className="admin-section-heading">
                    <div>
                      <h2>Product details</h2>
                      <p>Key information to describe and display your product.</p>
                    </div>
                    <span className="admin-status-chip">Required fields *</span>
                  </div>

                  <label>
                    Product name <span aria-hidden="true">*</span>
                    <input
                      defaultValue={editingProduct?.name ?? ""}
                      maxLength={160}
                      name="name"
                      placeholder="e.g. Classic Shaker Cabinet Door"
                      required
                    />
                  </label>

                  <div className="admin-field-grid">
                    <label>
                      Category <span aria-hidden="true">*</span>
                      <select
                        onChange={(event) => {
                          setSelectedParentCategoryId(event.currentTarget.value);
                          setSelectedSubcategoryId("");
                        }}
                        required
                        value={selectedParentCategoryId}
                      >
                        <option value="">Choose a category</option>
                        {categories.filter((category) => !category.parent_id).map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Subcategory
                      <select
                        aria-label="Subcategory (optional)"
                        disabled={!selectedParentCategoryId}
                        onChange={(event) => setSelectedSubcategoryId(event.currentTarget.value)}
                        value={selectedSubcategoryId}
                      >
                        <option value="">No subcategory</option>
                        {categories.filter((category) => category.parent_id === selectedParentCategoryId).map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="admin-field-grid">
                    <label>
                      Amazon price (USD)
                      <input
                        defaultValue={editingProduct?.amazon_price ?? ""}
                        min="0"
                        name="amazonPrice"
                        placeholder="e.g. 89.00"
                        step="0.01"
                        type="number"
                      />
                    </label>
                    <label>
                      Bosch price (USD)
                      <input
                        defaultValue={editingProduct?.bosch_price ?? ""}
                        min="0"
                        name="boschPrice"
                        placeholder="e.g. 64.50"
                        step="0.01"
                        type="number"
                      />
                    </label>
                  </div>

                  <label>
                    Description
                    <textarea
                      defaultValue={editingProduct?.description ?? ""}
                      maxLength={5000}
                      name="description"
                      placeholder="Write a short description highlighting key benefits and features."
                      rows={6}
                    />
                  </label>
                  <FormFeedback state={productState} />
                  <div className="admin-form-actions">
                    <button disabled={productPending} type="submit">
                      {productPending ? "Saving..." : editingProduct ? "Save changes" : "Publish product"}
                    </button>
                  </div>
                </section>
              </div>
            </form>
          ) : (
            <section className="admin-panel admin-category-editor">
              <div className="admin-section-heading">
                <div>
                  <h2>{editingCategory ? "Category details" : "Add a category"}</h2>
                  <p>Organize products with top-level categories and subcategories.</p>
                </div>
              </div>
              <form key={`${selectionKey}-${formKey}`} action={categoryAction} className="admin-form">
                {editingCategory && <input name="id" type="hidden" value={editingCategory.id} />}
                <ImageField
                  cloudName={cloudinaryCloudName}
                  defaultUrl={editingCategory?.image_url ?? ""}
                  uploadPreset={cloudinaryUploadPreset}
                />
                <label>
                  Name <span aria-hidden="true">*</span>
                  <input defaultValue={editingCategory?.name ?? ""} maxLength={120} name="name" required />
                </label>
                <label>
                  Parent category <span>(leave empty for a top-level category)</span>
                  <select defaultValue={editingCategory?.parent_id ?? ""} name="parentId">
                    <option value="">Top-level category</option>
                    {parentCategories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Description
                  <textarea
                    defaultValue={editingCategory?.description ?? ""}
                    maxLength={2000}
                    name="description"
                    rows={5}
                  />
                </label>
                <FormFeedback state={categoryState} />
                <div className="admin-form-actions">
                  <button disabled={categoryPending} type="submit">
                    {categoryPending ? "Saving..." : editingCategory ? "Update category" : "Add category"}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
