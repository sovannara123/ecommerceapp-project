import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppProviders } from "@/shared/providers/app-providers";
import { Navbar } from "@/shared/ui/navigation/Navbar";
import { InactivityGuard } from "@/shared/ui/auth/InactivityGuard";

export const metadata: Metadata = {
  title: {
    default: "Northstar Commerce",
    template: "%s | Northstar Commerce"
  },
  description: "Premium ecommerce storefront integrated with backend services.",
  metadataBase: new URL("http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <InactivityGuard>
            <Navbar />
            <main className="min-h-[calc(100vh-64px)] py-8">{children}</main>
          </InactivityGuard>
        </AppProviders>
      </body>
    </html>
  );
}
