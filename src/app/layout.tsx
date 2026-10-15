import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn/wght.css";
import "./globals.css";

const siteURL = process.env.SITE_URL || "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(siteURL),
  title: { default: "حاشیه — یادداشت‌هایی برای ساختن", template: "%s | حاشیه" },
  description:
    "مجله‌ای برای ایده‌هایی که آینده را می‌سازند؛ یادداشت‌هایی دربارهٔ طراحی، فناوری و ساختن.",
  openGraph: { type: "website", locale: "fa_IR", siteName: "حاشیه" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" data-scroll-behavior="smooth">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
