import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "AstroML Studio",
  description: "코드 없이, 천문 이미지로 머신러닝.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 기본 다크(워크벤치·천문 친화). 헤더에서 라이트 토글 가능.
  return (
    <html lang="ko" className="dark">
      <body>
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
