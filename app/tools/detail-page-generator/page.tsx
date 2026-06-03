import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI 상세페이지 생성기",
  description: "GOUN LOG에서 준비 중인 AI 상세페이지 생성기입니다.",
};

export default function DetailPageGeneratorPage() {
  return (
    <main className="simple-page">
      <section>
        <p className="eyebrow">Tool</p>
        <h1>AI 상세페이지 생성기</h1>
        <div className="tool-item">
          <h2>곧 공개됩니다.</h2>
          <p>
            상품 정보를 입력하면 상세페이지 초안을 가볍게 만들어볼 수 있는 도구로 준비 중입니다.
            완성도를 높여 공개하겠습니다.
          </p>
        </div>
        <Link href="/tools" className="back-link">
          도구 목록으로
        </Link>
      </section>
    </main>
  );
}
