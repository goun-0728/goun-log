import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "도구",
  description: "GOUN LOG에서 준비한 온라인 판매 도구입니다.",
};

export default function ToolsPage() {
  return (
    <main className="simple-page">
      <section>
        <p className="eyebrow">Tools</p>
        <h1>도구</h1>
        <div className="tool-item">
          <h2>상세페이지 생성기</h2>
          <p>
            제품사진을 준비하면 상세페이지 초안을 가볍게 만들어볼 수 있는 도구입니다.
            <br />
            생성은 무료이고, 다운로드할 때만 결제합니다.
          </p>
          <Link href="/tools/detail-page-generator" className="tool-link">
            자세히 보기
          </Link>
        </div>
      </section>
    </main>
  );
}
