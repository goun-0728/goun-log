export default function HeroTicker() {
  return (
    <section className="hero-section" aria-labelledby="site-title">
      <div className="hero-grid">
        <div className="hero-copy-card">
          <div>
            <p className="hero-kicker">온라인 판매와 마케팅에 대한 기록</p>
            <h1 id="site-title">
              제품사진만 있다면,
              <br />
              상세페이지 초안을 쉽게
              <br />
              만들어볼 수 있습니다.
            </h1>
            <p className="hero-description">
              직접 온라인 판매를 하며 부딪히고 배운 것들을
              <br />
              기록하고, 도구로 만들고, 함께 나눕니다.
            </p>
          </div>

          <aside className="hero-consult-card" aria-label="교육 컨설팅 안내">
            <strong>교육·컨설팅 안내</strong>
            <p>
              온라인 판매가 막막할 때,
              <br />
              같이 고민하고 방법을 찾아봐요.
            </p>
          </aside>
        </div>

        <div className="hero-tool-card">
          <div className="home-showcase">
            <img src="/images/home-showcase.png" alt="상세페이지 쇼케이스" />
            <div className="home-showcase-copy">
              <strong>AI 상세페이지 생성기</strong>
              <span>
                제품사진만 준비해도
                <br />
                초안을 만들어볼 수 있어요.
              </span>
            </div>
          </div>

          <a className="hero-tool-button" href="https://contentos-one-theta.vercel.app/" target="_blank" rel="noreferrer">
            <strong>AI 상세페이지 생성기</strong>
            <span>
              제품사진을 준비해주세요.
              <br />
              생성은 무료이고, 다운로드할 때만 결제합니다.
            </span>
          </a>

          <div className="hero-free-card">
            <strong>생성은 무료입니다.</strong>
            <p>
              상세페이지 제작을 업체에 맡기면 적게는 몇 만원, 많게는 10만원 이상 비용이 발생하기도 합니다.
            </p>
            <p>먼저 원하는 대로 만들어보세요.</p>
            <p>마음에 들면 다운로드하고, 아니면 비용 없이 생성만 해보셔도 됩니다.</p>
            <b>상세페이지 1건당 2,900원 입니다.</b>
          </div>
        </div>
      </div>
    </section>
  );
}
