import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의",
  description: "GOUN LOG 문의 연락처입니다.",
};

export default function ContactPage() {
  return (
    <main className="simple-page">
      <section>
        <p className="eyebrow">Contact</p>
        <h1>문의</h1>
        <dl className="contact-list">
          <div>
            <dt>이메일</dt>
            <dd>contact@gounlog.kr</dd>
          </div>
          <div>
            <dt>오픈채팅</dt>
            <dd>준비중</dd>
          </div>
        </dl>
        <p className="muted-copy">향후 상담 문의 창구를 추가할 예정입니다.</p>
      </section>
    </main>
  );
}
