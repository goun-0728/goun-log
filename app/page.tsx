import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import HomeStats from "@/components/HomeStats";
import { formatDate, getArticleThumbnailUrl } from "@/lib/article-shared";
import { getPublishedArticles } from "@/lib/articles";
import { getVisitStats } from "@/lib/visits";

export const dynamic = "force-dynamic";

const generatorUrl = "https://contentos-one-theta.vercel.app/";

export default async function Home() {
  const [articles, stats] = await Promise.all([getPublishedArticles(), getVisitStats()]);
  const latestArticles = articles.slice(0, 3);
  const displayStats = {
    ...stats,
    published: stats.published || articles.length,
  };

  return (
    <main className="home-page">

      {/* ① AI 상세페이지 생성기 */}
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-image">
          <SafeImage
            src="/images/home-showcase.png"
            alt="AI 상세페이지 생성기 예시"
            className="home-showcase-img"
          />
        </div>
        <div className="home-hero-copy">
          <p className="home-eyebrow">AI 상세페이지 생성기</p>
          <h1 id="home-title">
            제품사진만 있다면,<br />
            상세페이지 초안을<br />
            쉽게 만들 수 있습니다.
          </h1>
          <p className="home-hero-desc">
            상세페이지 제작을 업체에 맡기면 적게는 몇 만원,<br />
            많게는 몇십 몇백만원 이상 비용이 발생합니다.<br />
            먼저 원하는 대로 만들어보세요.<br />
            마음에 들면 다운로드, 아니면 비용 없이 생성만 해도 됩니다.
          </p>
          <a href={generatorUrl} target="_blank" rel="noopener noreferrer" className="home-hero-btn">
            상세페이지 생성하기 →
          </a>
          <p className="home-hero-price">다운로드는 1건 2,900원</p>
        </div>
      </section>

      {/* ② 교육·컨설팅 */}
      <section className="home-consult" aria-labelledby="consult-title">
        <div className="home-consult-copy">
          <p className="home-eyebrow">교육·컨설팅</p>
          <h2 id="consult-title">혼자 고민하지 마세요.</h2>
          <p>
            온라인 판매에는 정답이 하나가 아니에요.<br />
            제가 직접 겪어본 방법 중에서<br />
            지금 상황에 맞는 방향을 함께 이야기하고 싶어요.
          </p>
          <Link href="/contact" className="home-consult-btn">
            교육·컨설팅 문의하기 →
          </Link>
        </div>
        <div className="home-consult-items">
          {[
            { icon: "○", title: "직접 판매하며 검증한 전략", desc: "이론이 아닌, 실제 해본 과정과 방법을 공유합니다." },
            { icon: "◇", title: "상세페이지 구조 연구", desc: "판매 흐름을 이해하기 쉬운 구조와 메시지를 계속 연구합니다." },
            { icon: "△", title: "광고·마케팅 실전 노하우", desc: "광고 세팅부터 운영까지, 경험에서 얻은 인사이트를 나눕니다." },
            { icon: "□", title: "함께 성장하는 파트너", desc: "정답은 없지만, 함께 고민하며 성장하는 파트너가 되고 싶습니다." },
          ].map((item) => (
            <div key={item.title} className="home-consult-item">
              <span className="home-consult-icon">{item.icon}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ③ 최근 글 */}
      <section className="latest-card-section" aria-labelledby="latest-title">
        <div className="latest-heading">
          <h2 id="latest-title">최근 글</h2>
          <Link href="/archive">모든 글 보기 →</Link>
        </div>
        <div className="latest-card-grid">
          {latestArticles.map((article) => {
            const thumbnailUrl = getArticleThumbnailUrl(article);
            return (
              <article key={article.id} className="latest-card">
                {thumbnailUrl ? (
                  <Link href={`/articles/${article.slug}`} className="latest-card-image" aria-label={`${article.title} 보기`}>
                    <SafeImage src={thumbnailUrl} alt="" />
                  </Link>
                ) : null}
                <div className="latest-card-body">
                  <p className="latest-card-category">온라인 판매</p>
                  <h3><Link href={`/articles/${article.slug}`}>{article.title}</Link></h3>
                  {article.description ? <p className="latest-card-description">{article.description}</p> : null}
                  <time>{formatDate(article.published_at || article.created_at)}</time>
                </div>
              </article>
            );
          })}
          {!latestArticles.length ? <p className="empty-state">아직 발행된 글이 없습니다.</p> : null}
        </div>
      </section>

      {/* ④ 통계 */}
      <section className="home-stats-wrap home-stats-soft" aria-label="사이트 통계">
        <HomeStats stats={displayStats} />
      </section>

    </main>
  );
}