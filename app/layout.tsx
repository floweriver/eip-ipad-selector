// v1.1.0 | 2026-07-20 | 全站版型：改正式站名、語系 zh-TW（原為 create-next-app 預設）
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "eiP 挑 iPad 配件｜找到最適合你 iPad 的配件",
  description: "選好你的 iPad 系列與型號，馬上看到相容的 eiP 配件，並比較 Apple 原廠配件幫你算出省多少。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
