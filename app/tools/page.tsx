import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "도구",
  description: "GOUN LOG에서 준비 중인 온라인 판매 도구입니다.",
};

export default function ToolsPage() {
  return (
    <main className="simple-page">
      <section>
        <p className="eyebrow">Tools</p>
        <h1>도구</h1>
        <div className="tool-item">
          <h2>상세페이지 생성기</h2>
          <p>상품 정보를 입력하면 상세페이지 초안을 만들어보는 도구입니다. 곧 공개됩니다.</p>
          <Link href="/tools/detail-page-generator" className="tool-link">
            자세히 보기
          </Link>
        </div>
      </section>
    </main>
  );
}
