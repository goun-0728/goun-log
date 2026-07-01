import Link from "next/link";
import AuthButton from "@/components/auth/AuthButton";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/archive", label: "셀러 이야기" },
  { href: "/tools", label: "도구" },
  { href: "/contact", label: "교육·컨설팅 문의" },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-lockup" aria-label="GOUN LOG 홈">
        <span className="brand-name">GOUN LOG</span>
        <span className="brand-subtitle">온라인 판매와 마케팅에 대한 기록</span>
      </Link>
      <div className="site-header-right">
        <nav className="site-nav" aria-label="상단 메뉴">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <AuthButton />
      </div>
    </header>
  );
}
