import "./globals.css";
import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <Header />
        <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
