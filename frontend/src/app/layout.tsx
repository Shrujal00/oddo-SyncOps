import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SyncOps",
  description: "From Demand to Delivery",
  icons: {
    icon: "/SyncOps.png",
    apple: "/SyncOps.png",
  },
  openGraph: {
    title: "SyncOps",
    description: "From Demand to Delivery",
    images: ["/SyncOps.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
