import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의",
  description: "GOUN LOG 문의 연락처입니다.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-16">
      <section className="max-w-[660px]">
        <h1 className="mb-10 text-[32px] font-semibold leading-tight sm:text-[42px]">문의</h1>
        <dl className="border-t border-neutral-200 text-[16px]">
          <div className="grid grid-cols-[88px_1fr] gap-5 border-b border-neutral-200 py-5">
            <dt className="text-neutral-500">이메일</dt>
            <dd className="text-neutral-800">contact@gounlog.kr</dd>
          </div>
          <div className="grid grid-cols-[88px_1fr] gap-5 border-b border-neutral-200 py-5">
            <dt className="text-neutral-500">오픈채팅</dt>
            <dd className="text-neutral-800">준비중</dd>
          </div>
        </dl>
        <p className="mt-8 text-[15px] leading-8 text-neutral-500">향후 상담 문의 폼을 추가할 예정입니다.</p>
      </section>
    </main>
  );
}
