import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import VisitTracker from "@/components/VisitTracker";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

const siteTitle = "GOUN LOG";
const description = "온라인 판매와 마케팅에 대한 기록";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goun-log.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description,
  openGraph: {
    title: siteTitle,
    description,
    siteName: siteTitle,
    locale: "ko_KR",
    type: "website",
    images: ["/og-default.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={notoSansKr.variable}>
        <AuthProvider>
          <SiteHeader />
          <VisitTracker />
          {children}
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}