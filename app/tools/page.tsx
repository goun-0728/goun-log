import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "도구",
  description: "GOUN LOG에서 준비 중인 온라인 판매와 마케팅 도구 목록입니다.",
};

const tools = ["상세페이지 생성기", "상품명 생성기", "광고문구 생성기", "블로그 생성기"];

export default function ToolsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-16">
      <section className="max-w-[660px]">
        <p className="mb-4 text-[14px] text-neutral-500">v1</p>
        <h1 className="mb-10 text-[32px] font-semibold leading-tight sm:text-[42px]">준비중입니다.</h1>
        <ul className="border-t border-neutral-200">
          {tools.map((tool) => (
            <li key={tool} className="border-b border-neutral-200 py-5 text-[17px] text-neutral-700">
              {tool}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
