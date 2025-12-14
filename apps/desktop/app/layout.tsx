import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tauri + Next.js Starter",
  description: "Production-grade local-first desktop app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
