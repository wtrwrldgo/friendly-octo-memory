// file: app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { FirmDataProvider } from "@/contexts/FirmDataContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LayoutContent from "@/components/LayoutContent";

export const metadata: Metadata = {
  metadataBase: new URL("https://watergocrm.uz"),
  title: "WaterGo CRM",
  description: "WaterGo CRM platform for admin and firm management.",
  applicationName: "WaterGo CRM",
  icons: {
    icon: "/watergo-logo.png",
    apple: "/watergo-logo.png",
    shortcut: "/watergo-logo.png",
  },
  openGraph: {
    type: "website",
    url: "https://watergocrm.uz",
    siteName: "WaterGo CRM",
    title: "WaterGo CRM",
    description: "WaterGo CRM platform for admin and firm management.",
    images: [
      {
        url: "/watergo-logo.png",
        width: 1024,
        height: 1024,
        alt: "WaterGo Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "WaterGo CRM",
    description: "WaterGo CRM platform for admin and firm management.",
    images: ["/watergo-logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "WaterGo",
              url: "https://watergocrm.uz",
              logo: "https://watergocrm.uz/watergo-logo.png",
            }),
          }}
        />
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <FirmDataProvider>
                <SubscriptionProvider>
                  <ToastProvider>
                    <LayoutContent>{children}</LayoutContent>
                  </ToastProvider>
                </SubscriptionProvider>
              </FirmDataProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
