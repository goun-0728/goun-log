import Link from "next/link";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/about", label: "소개" },
  { href: "/tools", label: "도구" },
  { href: "/contact", label: "문의" },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-lockup" aria-label="GOUN LOG 홈">
        <span className="brand-name">GOUN LOG</span>
        <span className="brand-subtitle">온라인 판매와 마케팅에 대한 기록</span>
      </Link>
      <nav className="site-nav" aria-label="상단 메뉴">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
