"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  deleteCategory,
  deleteProduct,
  deleteTestimonial,
  loginAdmin,
  logoutAdmin,
  saveCategory,
  saveBanner,
  saveProduct,
  saveTestimonial,
  toggleBanner,
  type ActionResult,
} from "./actions";
import type { AdminOverview, Category, Product, SiteBanner, Testimonial } from "@/lib/catalog";

const initialState: ActionResult = {};
const NEW_ITEM = "new";

type Selection = { kind: "product" | "category" | "testimonial"; id: string } | null;
type AdminView = "home" | "products" | "category" | "testimonials" | "banner";

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
    currency: "INR",
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
  testimonials,
  banner,
  overview,
  cloudinaryCloudName,
  cloudinaryUploadPreset,
}: {
  categories: Category[];
  products: Product[];
  testimonials: Testimonial[];
  banner: SiteBanner | null;
  overview: AdminOverview;
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
}) {
  const [activeView, setActiveView] = useState<AdminView>("home");
  const [selection, setSelection] = useState<Selection>(null);
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [notice, setNotice] = useState<ActionResult>({});
  const [isDeleting, startDelete] = useTransition();
  const editorRef = useRef<HTMLDivElement>(null);
  const editorFieldRef = useRef<HTMLInputElement>(null);

  const [productState, productAction, productPending] = useActionState(saveProduct, initialState);
  const [categoryState, categoryAction, categoryPending] = useActionState(saveCategory, initialState);
  const [testimonialState, testimonialAction, testimonialPending] = useActionState(saveTestimonial, initialState);
  const [bannerState, bannerAction, bannerPending] = useActionState(saveBanner, initialState);
  const [bannerToggleState, bannerToggleAction, bannerTogglePending] = useActionState(toggleBanner, initialState);

  const editingProduct =
    selection?.kind === "product" && selection.id !== NEW_ITEM
      ? products.find((product) => product.id === selection.id) ?? null
      : null;
  const editingCategory =
    selection?.kind === "category" && selection.id !== NEW_ITEM
      ? categories.find((category) => category.id === selection.id) ?? null
      : null;
  const editingTestimonial =
    selection?.kind === "testimonial" && selection.id !== NEW_ITEM
      ? testimonials.find((testimonial) => testimonial.id === selection.id) ?? null
      : null;
  const isNewProduct = selection?.kind === "product" && selection.id === NEW_ITEM;
  const isNewCategory = selection?.kind === "category" && selection.id === NEW_ITEM;
  const isNewTestimonial = selection?.kind === "testimonial" && selection.id === NEW_ITEM;

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

  useEffect(() => {
    if (activeView === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    editorFieldRef.current?.focus({ preventScroll: true });
    const editorTop = (
      editorFieldRef.current ?? editorRef.current
    )?.getBoundingClientRect().top;
    if (editorTop !== undefined) {
      window.scrollTo({
        top: Math.max(0, window.scrollY + editorTop - 16),
        behavior: "smooth",
      });
    }
  }, [activeView, selection]);

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

  function showView(view: AdminView) {
    setActiveView(view);
    if (view === "home") {
      select(null);
    } else if (view === "products") {
      select({ kind: "product", id: NEW_ITEM });
    } else if (view === "category") {
      select({ kind: "category", id: NEW_ITEM });
    } else if (view === "testimonials") {
      select({ kind: "testimonial", id: NEW_ITEM });
    } else {
      select(null);
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
              {activeView === "home"
                ? "Dashboard"
                : activeView === "products"
                  ? editingProduct ? "Edit Product" : "Products"
                  : activeView === "category"
                    ? editingCategory ? "Edit Category" : "Add Category"
                    : activeView === "testimonials"
                      ? editingTestimonial ? "Edit Testimonial" : "Testimonials"
                      : "Banner"}
            </h1>
            <p>Catalog management <span aria-hidden="true">/</span> {activeView === "category" ? "Categories" : activeView === "testimonials" ? "Testimonials" : activeView === "products" ? "Products" : activeView === "banner" ? "Banner" : "Overview"}</p>
          </div>
        </div>
        <div className="admin-header-actions">
          <form action={logoutAdmin}>
            <button className="admin-logout" type="submit">Sign out</button>
          </form>
          {activeView === "products" && selection?.kind === "product" && (
            <button className="admin-publish-button" disabled={productPending} form="product-form" type="submit">
              {productPending ? "Saving..." : editingProduct ? "Save changes" : "Publish product"}
            </button>
          )}
          {activeView === "testimonials" && selection?.kind === "testimonial" && (
            <button className="admin-publish-button" disabled={testimonialPending} form="testimonial-form" type="submit">
              {testimonialPending ? "Saving..." : editingTestimonial ? "Save changes" : "Add testimonial"}
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
            <button
              className={`admin-nav-action ${activeView === "home" ? "is-active" : ""}`}
              onClick={() => showView("home")}
              type="button"
            >
              <span aria-hidden="true">⌂</span> Home
            </button>
            <button
              className={`admin-nav-action ${activeView === "products" ? "is-active" : ""}`}
              onClick={() => showView("products")}
              type="button"
            >
              <span aria-hidden="true">▧</span> Products
              <span className="admin-nav-count">{products.length}</span>
            </button>
            <button
              className={`admin-nav-action ${activeView === "category" ? "is-active" : ""}`}
              onClick={() => showView("category")}
              type="button"
            >
              <span aria-hidden="true">▦</span> Add category
              <span className="admin-nav-add" aria-hidden="true">+</span>
            </button>
            <button
              className={`admin-nav-action ${activeView === "testimonials" ? "is-active" : ""}`}
              onClick={() => showView("testimonials")}
              type="button"
            >
              <span aria-hidden="true">❝</span> Testimonials
              <span className="admin-nav-count">{testimonials.length}</span>
            </button>
            <button
              className={`admin-nav-action ${activeView === "banner" ? "is-active" : ""}`}
              onClick={() => showView("banner")}
              type="button"
            >
              <span aria-hidden="true">▰</span> Banner
            </button>
          </nav>
        </aside>

        <div className="admin-main">
          {activeView === "home" ? (
            <AdminHomeDashboard
              onNavigate={showView}
              overview={overview}
            />
          ) : (
            <>
          {activeView === "products" && (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <h2>Products <span className="admin-list-count">{products.length}</span></h2>
                <button
                  className={isNewProduct ? "is-active" : ""}
                  onClick={() => select({ kind: "product", id: NEW_ITEM })}
                  type="button"
                >
                  + Add product
                </button>
              </div>
              {products.length === 0 ? (
                <p className="admin-empty">No products yet. Add your first product below.</p>
              ) : (
                <ul className="admin-manage-list">
                  {products.map((product) => (
                    <li key={product.id}>
                      <span className="admin-manage-thumb" style={{ backgroundImage: `url("${product.image_url}")` }} />
                      <span className="admin-manage-info">
                        <strong>{product.name}</strong>
                        <span>{categoryNameById.get(product.category_id) ?? "Uncategorized"}</span>
                      </span>
                      <span className="admin-manage-actions">
                        <button
                          onClick={() => select({ kind: "product", id: product.id })}
                          type="button"
                        >Edit</button>
                        <button
                          className="admin-delete"
                          disabled={isDeleting}
                          onClick={() => {
                            if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
                              runDelete(deleteProduct, product.id);
                            }
                          }}
                          type="button"
                        >Delete</button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeView === "category" && (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <h2>Categories <span className="admin-list-count">{categories.length}</span></h2>
                <button
                  className={isNewCategory ? "is-active" : ""}
                  onClick={() => select({ kind: "category", id: NEW_ITEM })}
                  type="button"
                >
                  + Add category
                </button>
              </div>
              {categories.length === 0 ? (
                <p className="admin-empty">No categories yet. Add your first category below.</p>
              ) : (
                <ul className="admin-manage-list">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <span className="admin-manage-info">
                        <strong>{category.parent_id ? `↳ ${category.name}` : category.name}</strong>
                        <span>{category.parent_id ? "Subcategory" : "Top-level category"}</span>
                      </span>
                      <span className="admin-manage-actions">
                        <button
                          onClick={() => select({ kind: "category", id: category.id })}
                          type="button"
                        >Edit</button>
                        <button
                          className="admin-delete"
                          disabled={isDeleting}
                          onClick={() => {
                            if (window.confirm(`Delete "${category.name}" and its subcategories?`)) {
                              runDelete(deleteCategory, category.id);
                            }
                          }}
                          type="button"
                        >Delete</button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeView === "testimonials" && (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <h2>Testimonials <span className="admin-list-count">{testimonials.length}</span></h2>
                <button
                  className={isNewTestimonial ? "is-active" : ""}
                  onClick={() => select({ kind: "testimonial", id: NEW_ITEM })}
                  type="button"
                >
                  + Add testimonial
                </button>
              </div>
              {testimonials.length === 0 ? (
                <p className="admin-empty">No testimonials yet. Add one below.</p>
              ) : (
                <ul className="admin-manage-list">
                  {testimonials.map((testimonial) => (
                    <li key={testimonial.id}>
                      <span className="admin-manage-info">
                        <strong>{testimonial.customer_name}</strong>
                        <span>{testimonial.content}</span>
                      </span>
                      <span className="admin-manage-actions">
                        <button
                          onClick={() => select({ kind: "testimonial", id: testimonial.id })}
                          type="button"
                        >Edit</button>
                        <button
                          className="admin-delete"
                          disabled={isDeleting}
                          onClick={() => {
                            if (window.confirm(`Delete the testimonial from "${testimonial.customer_name}"?`)) {
                              runDelete(deleteTestimonial, testimonial.id);
                            }
                          }}
                          type="button"
                        >Delete</button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <div className="admin-editor" ref={editorRef}>
          {activeView === "banner" ? (
            <section className="admin-panel admin-banner-editor">
              <div className="admin-section-heading">
                <div>
                  <h2>Store banner</h2>
                  <p>Manage the products-page image and festive price label.</p>
                </div>
              </div>
              <form
                action={bannerAction}
                className="admin-form"
                id="banner-form"
              >
                <ImageField
                  cloudName={cloudinaryCloudName}
                  defaultUrl={banner?.image_url ?? ""}
                  uploadPreset={cloudinaryUploadPreset}
                />
                <label>
                  Festival name
                  <input
                    defaultValue={banner?.festival_name ?? ""}
                    maxLength={80}
                    name="festivalName"
                    placeholder="e.g. Diwali"
                  />
                </label>
                <label className="admin-festive-toggle">
                  <input
                    defaultChecked={banner?.is_festive_offer ?? false}
                    name="isFestiveOffer"
                    type="checkbox"
                  />
                  Show festive offer label on product prices
                </label>
                <p className="admin-banner-status" role="status">
                  Banner is currently {banner?.is_active ? "active" : "inactive"}.
                </p>
                <p className="admin-banner-status" role="status">
                  Festive offer label is currently {banner?.is_festive_offer ? "enabled" : "disabled"}.
                </p>
                <FormFeedback state={bannerState} />
                <FormFeedback state={bannerToggleState} />
                <div className="admin-form-actions">
                  <button disabled={bannerPending} type="submit">
                    {bannerPending ? "Saving..." : "Save banner and offer"}
                  </button>
                  <button
                    aria-pressed={banner?.is_active ?? false}
                    disabled={bannerTogglePending}
                    formAction={bannerToggleAction}
                    type="submit"
                  >
                    {bannerTogglePending
                      ? "Updating..."
                      : banner?.is_active
                        ? "Deactivate banner"
                        : "Activate banner"}
                  </button>
                </div>
              </form>
            </section>
          ) : !selection ? (
            <section className="admin-panel admin-placeholder">
              <p className="eyebrow">{activeView === "products" ? "Product management" : activeView === "category" ? "Category management" : "Testimonial management"}</p>
              <h2>Select an item or add a new one.</h2>
              <p className="admin-panel-hint">Choose an item from the list above or use the add button.</p>
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
                      placeholder="e.g. Bosch Series 6 Washing Machine"
                      ref={editorFieldRef}
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

                  <div className="admin-field-grid admin-price-grid">
                    <label>
                      Bosch price (INR)
                      <input
                        defaultValue={editingProduct?.bosch_price ?? ""}
                        min="0"
                        name="boschPrice"
                        placeholder="e.g. 54990"
                        step="0.01"
                        type="number"
                      />
                    </label>
                    <label>
                      Amazon price (INR)
                      <input
                        defaultValue={editingProduct?.amazon_price ?? ""}
                        min="0"
                        name="amazonPrice"
                        placeholder="e.g. 49990"
                        step="0.01"
                        type="number"
                      />
                    </label>
                    <label>
                      Flipkart price (INR)
                      <input
                        defaultValue={editingProduct?.flipkart_price ?? ""}
                        min="0"
                        name="flipkartPrice"
                        placeholder="e.g. 48990"
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
          ) : selection.kind === "category" ? (
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
                  <input
                    defaultValue={editingCategory?.name ?? ""}
                    maxLength={120}
                    name="name"
                    ref={editorFieldRef}
                    required
                  />
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
          ) : (
            <section className="admin-panel admin-category-editor">
              <div className="admin-section-heading">
                <div>
                  <h2>{editingTestimonial ? "Testimonial details" : "Add a testimonial"}</h2>
                  <p>Customer stories are displayed on the homepage as soon as they are saved.</p>
                </div>
              </div>
              <form
                id="testimonial-form"
                key={`${selectionKey}-${formKey}`}
                action={testimonialAction}
                className="admin-form"
              >
                {editingTestimonial && <input name="id" type="hidden" value={editingTestimonial.id} />}
                <label>
                  Customer name <span aria-hidden="true">*</span>
                  <input
                    defaultValue={editingTestimonial?.customer_name ?? ""}
                    maxLength={120}
                    name="customerName"
                    placeholder="e.g. Alex Morgan"
                    ref={editorFieldRef}
                    required
                  />
                </label>
                <label>
                  Customer title <span>(optional)</span>
                  <input
                    defaultValue={editingTestimonial?.customer_title ?? ""}
                    maxLength={120}
                    name="customerTitle"
                    placeholder="e.g. Homeowner in Mumbai"
                  />
                </label>
                <label>
                  Testimonial <span aria-hidden="true">*</span>
                  <textarea
                    defaultValue={editingTestimonial?.content ?? ""}
                    maxLength={2000}
                    name="content"
                    placeholder="Share what the customer said about their experience."
                    required
                    rows={6}
                  />
                </label>
                <FormFeedback state={testimonialState} />
                <div className="admin-form-actions">
                  <button disabled={testimonialPending} type="submit">
                    {testimonialPending ? "Saving..." : editingTestimonial ? "Update testimonial" : "Add testimonial"}
                  </button>
                </div>
              </form>
            </section>
          )}
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminHomeDashboard({
  overview,
  onNavigate,
}: {
  overview: AdminOverview;
  onNavigate: (view: AdminView) => void;
}) {
  const metrics = [
    { label: "Price enquiries", value: overview.enquiryCount, detail: "Customer requests received" },
    { label: "Products", value: overview.productCount, detail: "Published in your catalog" },
    { label: "Categories", value: overview.categoryCount, detail: "Including subcategories" },
    { label: "Testimonials", value: overview.testimonialCount, detail: "Shown on the homepage" },
  ];

  return (
    <div className="admin-dashboard">
      <section className="admin-dashboard-welcome">
        <div>
          <p className="eyebrow">Store overview</p>
          <h2>Welcome back.</h2>
          <p>Here&apos;s how your product catalog and customer enquiries are doing.</p>
        </div>
        <button className="admin-publish-button" onClick={() => onNavigate("products")} type="button">
          + Add product
        </button>
      </section>

      <section aria-label="Store totals" className="admin-metric-grid">
        {metrics.map((metric, index) => (
          <article className="admin-metric-card" key={metric.label}>
            <span className="admin-metric-icon" aria-hidden="true">
              {["↗", "▧", "▦", "❝"][index]}
            </span>
            <p>{metric.label}</p>
            <strong>{metric.value.toLocaleString("en-IN")}</strong>
            <span>{metric.detail}</span>
          </article>
        ))}
      </section>

      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-dashboard-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Products by category</h2>
              <p>See how your active products are distributed.</p>
            </div>
            <button onClick={() => onNavigate("category")} type="button">Manage categories</button>
          </div>
          {overview.productsByCategory.length === 0 ? (
            <p className="admin-empty">No categories to show yet.</p>
          ) : (
            <ul className="admin-category-stats">
              {overview.productsByCategory.map((category) => (
                <li key={category.id}>
                  <span>
                    <strong>{category.name}</strong>
                    {category.parent_name && <small>{category.parent_name}</small>}
                  </span>
                  <b>{category.product_count.toLocaleString("en-IN")}</b>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-panel admin-dashboard-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Recent price enquiries</h2>
              <p>{overview.enquiryCount.toLocaleString("en-IN")} total customer requests</p>
            </div>
          </div>
          {overview.recentEnquiries.length === 0 ? (
            <p className="admin-empty">No price enquiries received yet.</p>
          ) : (
            <ul className="admin-enquiry-list">
              {overview.recentEnquiries.map((enquiry) => (
                <li key={enquiry.id}>
                  <div className="admin-enquiry-heading">
                    <strong>{enquiry.full_name}</strong>
                    <time dateTime={enquiry.created_at}>
                      {new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Kolkata",
                      }).format(new Date(enquiry.created_at))}
                    </time>
                  </div>
                  <span className="admin-enquiry-product">{enquiry.product_name}</span>
                  <div className="admin-enquiry-contact">
                    <a href={`tel:${enquiry.phone}`}>{enquiry.phone}</a>
                    <a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
