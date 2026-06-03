import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "교육·컨설팅 문의",
  description: "GOUN LOG 교육·컨설팅 문의 연락처입니다.",
};

export default function ContactPage() {
  return (
    <main className="simple-page">
      <section>
        <p className="eyebrow">Contact</p>
        <h1>교육·컨설팅 문의</h1>
        <div className="prose-block">
          <p>
            온라인 판매에는 정답이 하나가 아니에요.
            <br />
            지금 상황을 편하게 이야기해주시면, 직접 겪어본 방법 안에서 함께 방향을 찾아보겠습니다.
          </p>
        </div>
        <dl className="contact-list">
          <div>
            <dt>이메일</dt>
            <dd>
              <a href="mailto:goun-0728@naver.com">goun-0728@naver.com</a>
            </dd>
          </div>
          <div>
            <dt>카카오톡</dt>
            <dd>
              <a href="https://open.kakao.com/o/szcbcSxi" target="_blank" rel="noopener noreferrer">
                1:1대화 바로가기
              </a>
            </dd>
          </div>
        </dl>
        <p className="muted-copy">상담 가능 여부와 방식은 문의 내용을 확인한 뒤 안내드릴게요.</p>
      </section>
    </main>
  );
}
