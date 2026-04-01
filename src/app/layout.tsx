import type { Metadata } from "next";
import { DotGothic16 } from "next/font/google";
import "./globals.css";

const dotGothic = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dot-gothic",
});

export const metadata: Metadata = {
  title: "中原 功寛 ― なかはらのステータス",
  description: "連続起業家 × スイカ農家 × 廃校オーナー。中原功寛のぼうけんの記録。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${dotGothic.variable}`}>
        {children}
      </body>
    </html>
  );
}
