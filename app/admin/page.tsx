import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CatalogUnavailableError, getCatalogData } from "@/lib/catalog";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { AdminDashboard, AdminLoginForm } from "./AdminForms";
import "./admin.css";

export const metadata = {
  title: "Catalog Admin | Decore-ative Specialties",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="admin-page">
      <header className="admin-header">
        <Link className="brand" href="/" aria-label="Decore-ative Specialties home">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span className="brand-name"><strong>DECORE-ATIVE</strong><small>SPECIALTIES</small></span>
        </Link>
        <Link href="/products">View catalog <span aria-hidden="true">↗</span></Link>
      </header>
      <Suspense fallback={<p className="admin-loading">Loading catalog admin...</p>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}

async function AdminContent() {
  await connection();

  if (!isAdminConfigured()) {
    return (
      <section className="admin-auth-panel">
        <p className="eyebrow">Setup required</p>
        <h1>Configure your <em>admin access.</em></h1>
        <p>Add <code>ADMIN_PASSWORD</code> and <code>ADMIN_SESSION_SECRET</code> to <code>.env.local</code>, then restart the app.</p>
      </section>
    );
  }

  if (!(await isAdminAuthenticated())) {
    return (
      <section className="admin-auth-panel">
        <p className="eyebrow">Catalog administration</p>
        <h1>Sign in to <em>manage products.</em></h1>
        <AdminLoginForm />
      </section>
    );
  }

  let catalogData;

  try {
    catalogData = await getCatalogData();
  } catch (error) {
    if (!(error instanceof CatalogUnavailableError)) {
      throw error;
    }

    const message = {
      configuration: "Add your Neon DATABASE_URL to .env.local, then restart the app.",
      network: "The app cannot reach Neon right now. Check your internet/firewall access to Neon and try again.",
      schema: "The catalog tables are missing. Run db/schema.sql in the Neon SQL Editor to create the tables and sample data.",
    }[error.reason];

    return (
      <section className="admin-auth-panel" role="alert">
        <p className="eyebrow">Catalog connection</p>
        <h1>Catalog <em>unavailable.</em></h1>
        <p>{message}</p>
        <Link className="admin-retry" href="/admin">Try again <span aria-hidden="true">↻</span></Link>
      </section>
    );
  }

  return (
    <section className="admin-content">
      <AdminDashboard
        categories={catalogData.categories}
        cloudinaryCloudName={process.env.CLOUDINARY_CLOUD_NAME}
        cloudinaryUploadPreset={process.env.CLOUDINARY_UPLOAD_PRESET}
        products={catalogData.products}
      />
    </section>
  );
}
