import type { Metadata } from "next";
import "./globals.css";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
      <body>
        <ThemeProvider>
          <ErrorProvider>{children}</ErrorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
