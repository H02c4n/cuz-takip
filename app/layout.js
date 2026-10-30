import { Fraunces, Figtree } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-display" });
const figtree = Figtree({ subsets: ["latin", "latin-ext"], variable: "--font-body" });

export const metadata = {
  title: "Cüz Takip",
  description: "Arkadaşlarla birlikte Kur'an hatmi takibi",
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#0b4f4a" };

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${fraunces.variable} ${figtree.variable}`}>
      <body>{children}</body>
    </html>
  );
}
