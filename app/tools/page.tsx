import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "도구",
  description: "GOUN LOG에서 준비 중인 온라인 판매와 마케팅 도구입니다.",
};

export default function ToolsPage() {
  return (
    <main className="simple-page">
      <section>
        <p className="eyebrow">Tools</p>
        <h1>도구</h1>
        <div className="tool-item">
          <h2>상세페이지 생성기</h2>
          <p>곧 공개됩니다.</p>
        </div>
      </section>
    </main>
  );
}
