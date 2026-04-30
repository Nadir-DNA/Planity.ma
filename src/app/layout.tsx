import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { Providers } from "@/components/shared/providers";
import { ServiceWorkerRegistration } from "@/components/shared/service-worker-registration";

export const viewport: Viewport = {
  themeColor: "#f9f9f9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - Reservez votre rendez-vous beaute au Maroc`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "reservation",
    "beaute",
    "coiffeur",
    "barbier",
    "spa",
    "hammam",
    "Maroc",
    "Casablanca",
    "Rabat",
    "Marrakech",
  ],
  alternates: {
    canonical: "https://planity.ma",
  },
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: "https://planity.ma",
    siteName: APP_NAME,
    locale: "fr_MA",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr">
      <body className="font-sans antialiased">
        <ServiceWorkerRegistration />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
