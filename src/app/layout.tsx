import "~/styles/globals.css";
import "leaflet/dist/leaflet.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Aquintel",
  description: "Oil Spills Harm Aquatic Marines",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
