import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Decore-ative Specialties | Cabinet Components, Made with Care",
  description:
    "Custom cabinet doors, drawer boxes, and cabinet components for professionals. Thoughtful service, reliable delivery, and quality made in California.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
