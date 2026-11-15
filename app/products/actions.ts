"use server";

import { neon, NeonDbError } from "@neondatabase/serverless";
import "@/lib/neon";

export type PriceRequestState = {
  error?: string;
  message?: string;
  whatsappNotificationError?: string;
  whatsappUrl?: string;
};

const UUID_PATTERN = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/;

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function notifyStoreOnWhatsApp({
  email,
  fullName,
  phone,
  productName,
  recipient,
}: {
  email: string;
  fullName: string;
  phone: string;
  productName: string;
  recipient: string;
}): Promise<"sent" | "not-configured" | "failed"> {
  const accessToken = process.env.WHATSAPP_CLOUD_API_TOKEN?.trim() ?? "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ?? "";
  const templateName =
    process.env.WHATSAPP_NOTIFICATION_TEMPLATE_NAME?.trim() ?? "";
  const language =
    process.env.WHATSAPP_NOTIFICATION_TEMPLATE_LANGUAGE?.trim() || "en_US";
  const apiVersion =
    process.env.WHATSAPP_GRAPH_API_VERSION?.trim() || "v23.0";
  const requiredValues = [accessToken, phoneNumberId, templateName];

  if (requiredValues.every((value) => !value)) {
    return "not-configured";
  }

  if (
    requiredValues.some((value) => !value) ||
    !/^\d+$/.test(phoneNumberId) ||
    !/^[a-z0-9_]+$/.test(templateName) ||
    !/^v\d+\.\d+$/.test(apiVersion)
  ) {
    console.error("WhatsApp Cloud API configuration is incomplete or invalid.");
    return "failed";
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: recipient,
          type: "template",
          template: {
            name: templateName,
            language: { code: language },
            components: [
              {
                type: "body",
                parameters: [productName, fullName, phone, email].map((text) => ({
                  type: "text",
                  text,
                })),
              },
            ],
          },
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(`WhatsApp Cloud API returned HTTP ${response.status}.`);
      return "failed";
    }

    return "sent";
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }
    console.error("WhatsApp Cloud API request failed due to a network error.");
    return "failed";
  }
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
  const whatsappUrl = `https://wa.me/${whatsappNumber}?${query.toString()}`;
  const notificationResult = await notifyStoreOnWhatsApp({
    email,
    fullName,
    phone,
    productName: String(inserted[0].product_name),
    recipient: whatsappNumber,
  });

  if (notificationResult === "failed") {
    return {
      message: "Your request is saved. You can still send it to our team on WhatsApp.",
      whatsappNotificationError:
        "We couldn't send the automatic WhatsApp notification. Please continue to WhatsApp to send your request manually.",
      whatsappUrl,
    };
  }

  return {
    message:
      notificationResult === "sent"
        ? "Your request is saved. We notified our team, and WhatsApp is opening so you can also send your message."
        : "Your request is saved. Opening WhatsApp so you can send it to our team…",
    whatsappUrl,
  };
}
