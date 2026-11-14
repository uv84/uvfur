import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Appliance Studio | Home Appliances, Personal Service",
  description:
    "Discover Bosch home appliances and ask our team for your best price. Thoughtful service for your home.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
