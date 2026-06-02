import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의",
  description: "GOUN LOG 문의 연락처입니다.",
};

export default function ContactPage() {
  return (
    <main className="simple-page">
      <section>
        <h1>문의</h1>
        <dl className="contact-list">
          <div>
            <dt>이메일</dt>
            <dd>
              <a href="mailto:jjy116@naver.com">jjy116@naver.com</a>
            </dd>
          </div>
        </dl>
        <p className="muted-copy">문의 주시면 확인 후 답변드리겠습니다.</p>
      </section>
    </main>
  );
}
