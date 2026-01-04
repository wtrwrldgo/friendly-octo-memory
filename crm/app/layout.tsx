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
  title: "WaterGo Platform CRM",
  description: "Super admin control center",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
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
