import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import HomeStats from "@/components/HomeStats";
import { formatDate, getArticleThumbnailUrl } from "@/lib/article-shared";
import { getPublishedArticles } from "@/lib/articles";
import { getVisitStats } from "@/lib/visits";

export const dynamic = "force-dynamic";

const generatorUrl = "https://contentos-one-theta.vercel.app/";

const experienceItems = [
  {
    title: "직접 판매하며 검증한 전략",
    description: "이론이 아닌, 실제 해본 과정과 방법을 공유합니다.",
    icon: "○",
  },
  {
    title: "상세페이지 구조 연구",
    description: "판매 흐름을 이해하기 쉬운 구조와 메시지를 계속 연구합니다.",
    icon: "◇",
  },
  {
    title: "광고 · 마케팅 실전 노하우",
    description: "광고 세팅부터 운영까지, 경험에서 얻은 인사이트를 아낌없이 담아 나눕니다.",
    icon: "△",
  },
  {
    title: "함께 성장하는 파트너",
    description: "정답은 없지만, 함께 고민하며 성장하는 파트너가 되고 싶습니다.",
    icon: "□",
  },
];

export default async function Home() {
  const [articles, stats] = await Promise.all([getPublishedArticles(), getVisitStats()]);
  const latestArticles = articles.slice(0, 3);
  const displayStats = {
    ...stats,
    published: stats.published || articles.length,
  };

  return (
    <main className="home-page">
      <section className="single-hero" aria-labelledby="home-title">
        <div className="single-hero-copy">
          <h1 id="home-title">
            제품사진만 있다면,
            <br />
            상세페이지 초안을
            <br />
            쉽게 만들어 볼 수 있습니다.
          </h1>

          <div className="single-hero-description">
            <p>
              <strong>[생성은 무료입니다.]</strong>
            </p>
            <p>
              상세페이지 제작을 업체에 맡기면 적게는 몇 만원에서 많게는 몇 십만원 이상의 비용이 발생합니다.
            </p>
            <p>원하는대로 만들어보시고, 마음에 들면 다운로드 하고, 아니면 비용없이 생성만 해보셔도 됩니다.</p>
            <p>
              <strong>
                [상세페이지 1건당 <span>2,900원</span>입니다.]
              </strong>
            </p>
          </div>

          <a href={generatorUrl} target="_blank" rel="noopener noreferrer" className="single-hero-button">
            <span aria-hidden="true">✣</span>
            <strong>상세페이지 생성하기</strong>
            <em aria-hidden="true">→</em>
          </a>
        </div>

        <div className="single-hero-preview" aria-label="상세페이지 생성기 미리보기">
          <SafeImage src="/images/home-showcase.png" alt="AI 상세페이지 생성기 쇼케이스" className="single-showcase-image" />
          <div className="price-badge single-price-badge" aria-label="다운로드 가격">
            <span>DOWNLOAD</span>
            <strong>2,900원</strong>
            <small>고화질 PNG</small>
          </div>
        </div>
      </section>

      <section className="experience-section final-experience-section" aria-labelledby="experience-title">
        <div className="home-section-heading">
          <h2 id="experience-title">직접 경험한 것만 기록합니다.</h2>
          <span />
        </div>
        <div className="experience-grid">
          {experienceItems.map((item) => (
            <article key={item.title} className="experience-card">
              <div className="experience-icon" aria-hidden="true">
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

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
                  <h3>
                    <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                  </h3>
                  {article.description ? <p className="latest-card-description">{article.description}</p> : null}
                  <time>{formatDate(article.published_at || article.created_at)}</time>
                </div>
              </article>
            );
          })}
          {!latestArticles.length ? <p className="empty-state">아직 발행된 글이 없습니다.</p> : null}
        </div>
      </section>

      <section className="home-stats-wrap home-stats-soft" aria-label="사이트 통계">
        <HomeStats stats={displayStats} />
      </section>
    </main>
  );
}
