import VersionBadge from "@/components/version-badge";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Open IQ Lab — Uji Kemampuan Penalaran Matriks",
  description:
    "Uji penalaran abstrak berbasis matriks dengan skor theta dan persentil, bukan angka IQ.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="border-t">
          <div className="mx-auto flex h-12 max-w-6xl flex-wrap items-center justify-between gap-2 px-4 text-sm text-muted-foreground">
            <p>open-iq-lab</p>
            <VersionBadge />
          </div>
        </footer>
      </body>
    </html>
  );
}
