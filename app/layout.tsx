import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const siteTitle = "GOUN LOG";
const description = "온라인 판매와 마케팅에 대한 기록";

export const metadata: Metadata = {
  metadataBase: new URL("https://goun-log.vercel.app"),
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

const navItems = [
  { href: "/", label: "홈" },
  { href: "/about", label: "소개" },
  { href: "/tools", label: "도구" },
  { href: "/contact", label: "문의" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} min-h-screen bg-white text-neutral-950`}>
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-6 sm:px-6 sm:py-8">
          <Link href="/" className="text-[15px] font-semibold tracking-[0.08em]">
            GOUN LOG
          </Link>
          <nav aria-label="상단 메뉴" className="flex items-center gap-4 text-[14px] text-neutral-600 sm:gap-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-neutral-950">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
