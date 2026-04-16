'use client';

import { useEffect } from "react";
import "./globals.css";
import { initializeData } from "@/lib/initData";
import ChatWidget from "@/components/ChatWidget";
import ParticleBackground from "@/components/ParticleBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    initializeData();
    // Otomasyon motorunu başlat (her 5 dakikada bir)
    import('@/lib/automation').then(({ runAutomationEngine }) => {
      runAutomationEngine();
      const interval = setInterval(runAutomationEngine, 5 * 60 * 1000);
      return () => clearInterval(interval);
    });
  }, []);

  return (
    <html lang="tr">
      <body className="antialiased font-sans">
        <ParticleBackground />
        <div className="relative" style={{ zIndex: 1 }}>
          {children}
        </div>
        <ChatWidget />
      </body>
    </html>
  );
}
