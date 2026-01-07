import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WaterGo - Suv Yetkazib Berish Xizmati",
  description: "Toshkentda tez va ishonchli suv yetkazib berish xizmati. Uyingizga yoki ofisingizga toza ichimlik suvini buyurtma qiling.",
  keywords: "suv yetkazib berish, toza suv, Toshkent, ichimlik suvi, water delivery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
