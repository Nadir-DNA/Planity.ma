import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

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
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: "https://planity.ma",
    siteName: APP_NAME,
    locale: "fr_MA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
