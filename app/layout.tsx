import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 每日复盘",
  description: "用 AI 帮助你每日反思与成长",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-white text-gray-800 antialiased">
        {children}
      </body>
    </html>
  );
}
