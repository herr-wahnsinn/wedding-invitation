import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://wedding-invitation-taupe-nine.vercel.app"),
  title: "Андрей & Лилия — 16 сентября 2026",
  description: "Приглашение на свадьбу Андрея и Лилии в Санкт-Петербурге.",
  openGraph: {
    title: "Андрей & Лилия — 16 сентября 2026",
    description: "Приглашение на свадьбу Андрея и Лилии в Санкт-Петербурге.",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Андрей и Лилия" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Андрей & Лилия — 16 сентября 2026",
    description: "Приглашение на свадьбу Андрея и Лилии в Санкт-Петербурге.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
