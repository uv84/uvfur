import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "catalog_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

export function isAdminConfigured() {
  return Boolean(
    process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET,
  );
}

function createSignature(expiresAt: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }

  return createHmac("sha256", secret).update(expiresAt).digest("hex");
}

export function isValidAdminPassword(password: string) {
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return false;
  }

  const provided = Buffer.from(password);
  const expected = Buffer.from(expectedPassword);

  return (
    provided.length === expected.length && timingSafeEqual(provided, expected)
  );
}

export async function createAdminSession() {
  const expiresAt = String(
    Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  );
  const signature = createSignature(expiresAt);

  (await cookies()).set(COOKIE_NAME, `${expiresAt}.${signature}`, {
    httpOnly: true,
    maxAge: SESSION_DURATION_SECONDS,
    path: "/admin",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  if (!isAdminConfigured()) {
    return false;
  }

  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const [expiresAt, signature, extra] = token?.split(".") ?? [];

  if (
    !expiresAt ||
    !signature ||
    extra !== undefined ||
    !/^\d+$/.test(expiresAt) ||
    Number(expiresAt) <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  const expected = Buffer.from(createSignature(expiresAt));
  const provided = Buffer.from(signature);

  return (
    expected.length === provided.length && timingSafeEqual(expected, provided)
  );
}
