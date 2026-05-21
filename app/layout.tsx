import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "PromoçãoPro — as melhores ofertas, curadas por IA",
  description:
    "Promoções selecionadas automaticamente do Mercado Livre, filtradas por uma IA curadora.",
  applicationName: "PromoçãoPro",
  authors: [{ name: "PromoçãoPro" }],
  openGraph: {
    title: "PromoçãoPro",
    description: "Ofertas reais, curadas por IA.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ed2010",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="antialiased">
      <body className="font-sans">{children}</body>
    </html>
  );
}
