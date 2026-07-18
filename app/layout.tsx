import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Алексей & София — 18 августа 2026",
  description: "Приглашение на нашу свадьбу. Будем счастливы разделить этот день с вами.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
