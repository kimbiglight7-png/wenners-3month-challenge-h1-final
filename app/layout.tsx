import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wenners 3개월 챌린지 파이널 투표",
  description: "Wenners 3개월 챌린지 상반기 파이널 행사 투표 사이트",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
