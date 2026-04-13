import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Game Shop - Oyun Hesap & Item Satışı",
  description: "Güvenilir oyun hesap ve item satış platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
