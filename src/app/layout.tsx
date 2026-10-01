import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Vazirmatn, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const vazir = Vazirmatn({
  subsets: ["latin", "arabic"],
  variable: "--font-vazir",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "سانی‌.دِو — وبلاگ کد، طراحی و هر چیزی که وب را جذاب می‌کند",
    template: "%s — سانی‌.دِو",
  },
  description:
    "وبلاگ فارسی توسعه‌ی وب: Next.js 16، PostgreSQL، ری‌اکت و تجربه‌های واقعی از ساختن. دور از کلیشه‌ی CRUD.",
  keywords: ["nextjs", "react", "postgresql", "prisma", "وبلاگ برنامه‌نویسی", "آموزش وب"],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "سانی‌.دِو",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh bg-ink text-paper antialiased flex flex-col">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-[-40%] z-0 h-[70vh]"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 70% 30%, rgba(255,90,54,0.08), transparent), radial-gradient(ellipse 45% 40% at 20% 20%, rgba(255,178,107,0.05), transparent)",
          }}
        />
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
