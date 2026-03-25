import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_KR({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "YONSEI AKARAKA TICKETING",
  description: "2025 아카라카를 온누리에 티켓 신청 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-gray-900 bg-slate-50">{children}</body>
    </html>
  );
}
