import type { Metadata, Viewport } from "next";

import { AppProviders } from "@/components/app-providers";
import { SiteHeader } from "@/components/site-header";
import { ToastContainer } from "@/components/toast-container";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PromoçãoPro — as melhores ofertas, curadas por IA",
    template: "%s | PromoçãoPro",
  },
  description:
    "Promoções do Mercado Livre curadas por IA, com busca inteligente, filtros avançados, favoritos e alertas de preço.",
  applicationName: "PromoçãoPro",
  authors: [{ name: "PromoçãoPro" }],
  openGraph: {
    title: "PromoçãoPro",
    description: "Ofertas reais do Mercado Livre, curadas por IA.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="antialiased">
      <body className="font-sans bg-white text-zinc-900">
        <a
          href="#conteudo-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-orange-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Ir para o conteúdo
        </a>
        <AppProviders>
          <SiteHeader />
          <div id="conteudo-principal">{children}</div>
          <ToastContainer />
        </AppProviders>
      </body>
    </html>
  );
}
