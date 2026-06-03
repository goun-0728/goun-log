import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div>
          <strong>GOUN LOG</strong>
          <p>
            온라인 판매를 하며 기록하고
            <br />
            나누는 공간입니다.
          </p>
        </div>
        <div>
          <strong>바로가기</strong>
          <nav aria-label="푸터 바로가기">
            <Link href="/archive">아카이브</Link>
            <Link href="/tools">도구</Link>
            <Link href="/contact">교육·컨설팅 문의</Link>
          </nav>
        </div>
        <div>
          <strong>연락하기</strong>
          <dl>
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
        </div>
      </div>
      <p className="footer-copy">© 2026 GOUN LOG. All rights reserved.</p>
    </footer>
  );
}
