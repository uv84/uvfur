"use server";

import { neon, NeonDbError } from "@neondatabase/serverless";
import "@/lib/neon";

export type PriceRequestState = {
  error?: string;
  message?: string;
  whatsappUrl?: string;
};

const UUID_PATTERN = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/;

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createPriceRequest(
  _previousState: PriceRequestState,
  formData: FormData,
): Promise<PriceRequestState> {
  const productId = formText(formData, "productId");
  const fullName = formText(formData, "fullName");
  const phone = formText(formData, "phone");
  const email = formText(formData, "email").toLowerCase();
  const phoneDigits = phone.replace(/\D/g, "");

  if (!UUID_PATTERN.test(productId)) {
    return { error: "Please choose a valid product and try again." };
  }
  if (fullName.length < 2 || fullName.length > 120) {
    return { error: "Enter your name (2 to 120 characters)." };
  }
  if (!PHONE_PATTERN.test(phone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
    return { error: "Enter a valid phone number, including your country code." };
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return { error: "Price requests are unavailable until the database is configured." };
  }

  let inserted;
  try {
    const sql = neon(databaseUrl);
    inserted = await sql`
      INSERT INTO price_requests (product_id, product_name, full_name, phone, email)
      SELECT id, name, ${fullName}, ${phone}, ${email}
      FROM products
      WHERE id = ${productId}::uuid AND is_active = true
      RETURNING product_name
    `;
  } catch (error) {
    if (error instanceof NeonDbError && error.code === "42P01") {
      return { error: "Price requests are not set up yet. Please contact us directly." };
    }
    throw error;
  }

  if (inserted.length === 0) {
    return { error: "This product is no longer available. Please refresh and try again." };
  }

  const configuredNumber = process.env.WHATSAPP_BUSINESS_NUMBER?.trim() ?? "";
  const whatsappNumber = configuredNumber.replace(/\D/g, "");
  const hasValidWhatsAppNumber =
    /^\+?[1-9][\d\s().-]*$/.test(configuredNumber) &&
    whatsappNumber.length >= 8 &&
    whatsappNumber.length <= 15;

  if (!hasValidWhatsAppNumber || !whatsappNumber) {
    return {
      message:
        "Your request is saved, but WhatsApp contact is not configured. Please contact our team directly.",
    };
  }

  const message = [
    "Hello, I would like a better price for:",
    `Product: ${String(inserted[0].product_name)}`,
    `Name: ${fullName}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
  ].join("\n");
  const query = new URLSearchParams({ text: message });

  return {
    message: "Your request is saved. Opening WhatsApp…",
    whatsappUrl: `https://wa.me/${whatsappNumber}?${query.toString()}`,
  };
}
