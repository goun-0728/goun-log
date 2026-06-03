import type { Metadata } from "next";
import Link from "next/link";

const generatorUrl = "https://contentos-one-theta.vercel.app/";

export const metadata: Metadata = {
  title: "AI 상세페이지 생성기",
  description: "제품사진을 준비하면 상세페이지 초안을 쉽게 만들어볼 수 있는 GOUN LOG 도구입니다.",
};

export default function DetailPageGeneratorPage() {
  return (
    <main className="simple-page">
      <section>
        <p className="eyebrow">Tool</p>
        <h1>AI 상세페이지 생성기</h1>
        <div className="tool-item">
          <h2>제품사진을 준비해주세요.</h2>
          <p>
            생성은 무료이고, 다운로드할 때만 결제합니다.
            <br />
            마음에 드는 초안이 나왔을 때 1건 2,900원으로 고화질 PNG를 다운로드할 수 있습니다.
          </p>
          <a href={generatorUrl} target="_blank" rel="noopener noreferrer" className="tool-link">
            생성기 열기
          </a>
        </div>
        <Link href="/tools" className="back-link">
          도구 목록으로
        </Link>
      </section>
    </main>
  );
}
