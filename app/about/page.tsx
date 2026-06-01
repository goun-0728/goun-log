import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
  description: "GOUN LOG를 운영하는 사람과 기록의 방향을 소개합니다.",
};

export default function AboutPage() {
  return (
    <main className="simple-page">
      <section>
        <p className="eyebrow">About</p>
        <h1>안녕하세요.</h1>
        <div className="prose-block">
          <p>GOUN LOG는 온라인 판매와 마케팅을 실행하며 남기는 기록입니다.</p>
          <p>
            상세페이지 제작, 스마트스토어 운영, 광고 세팅, AI 활용처럼 매일의 실무에서 배우고 정리한 내용을
            차분하게 쌓아갑니다.
          </p>
          <p>이곳은 경험한 것과 생각한 것을 오래 꺼내볼 수 있게 정리하는 아카이브입니다.</p>
        </div>
      </section>
    </main>
  );
}
