import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
  description: "GOUN LOG를 운영하는 사람과 기록의 방향을 소개합니다.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-16">
      <section className="max-w-[660px]">
        <h1 className="mb-10 text-[32px] font-semibold leading-tight sm:text-[42px]">안녕하세요.</h1>
        <div className="space-y-7 text-[17px] leading-9 text-neutral-700">
          <p>고운기획을 운영하고 있는 운영자입니다.</p>
          <p>
            온라인 판매, 상세페이지 제작, 스마트스토어 운영, 광고 세팅, AI 활용에 대해 기록하고 있습니다.
          </p>
          <p>이곳은 제가 경험하고 생각한 것들을 정리하는 공간입니다.</p>
        </div>
      </section>
    </main>
  );
}
