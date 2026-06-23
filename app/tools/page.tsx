import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "도구",
  description: "GOUN LOG에서 준비한 온라인 판매 도구입니다.",
};
const generatorUrl = "https://food-detail-generator.vercel.app/";
export default function ToolsPage() {
  return (
    <main className="simple-page">
      <section>
        <p className="eyebrow">Tools</p>
        <h1>도구</h1>
        <div className="tool-item">
          <h2>AI 상세페이지 생성기</h2>
          <p>
            제품사진을 준비하면 상세페이지 초안을 가볍게 만들어볼 수 있는 도구입니다.
            <br />
            생성은 무료이고, 다운로드할 때만 결제합니다.
          </p>
          <a href={generatorUrl} target="_blank" rel="noopener noreferrer" className="tool-link">
            생성기 열기
          </a>
        </div>
        <div className="tool-item">
          <h2>택배 공지 이미지 생성기</h2>
          <p>
            설·추석 등 택배 휴무 공지 이미지를 빠르게 만들 수 있는 도구입니다.
            <br />
            달력으로 날짜 선택, 분위기 설정, PNG 다운로드까지 무료입니다.
          </p>
          <a href="/tools/delivery-notice" className="tool-link">
            생성기 열기
          </a>
        </div>
      </section>
    </main>
  );
}
