import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agenda LGBT — Tous les événements LGBT en France & Belgique",
  description:
    "Découvrez tous les événements LGBT+ en France et en Belgique. Concerts, soirées, marches des fiertés, expositions… Téléchargez l'app Agenda LGBT gratuitement.",
  keywords: "agenda lgbt, événements lgbt, pride, france, belgique, gay, lesbian, queer",
  openGraph: {
    title: "Agenda LGBT",
    description: "Tous les événements LGBT en France & Belgique",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} bg-[#0a0a0f] text-white antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
