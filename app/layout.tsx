import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "짐토리 | 문 앞 픽업 보관",
  description: "짐은 맡기고, 잠깐 안 쓰는 물품은 수익화까지. 짐토리 베타 서비스입니다.",
  manifest: "/manifest.webmanifest",
  other: { "codex-preview": "development" },
  icons: { icon: "/assets/zimtori-symbol.png", apple: "/assets/zimtori-symbol.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffb629",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
