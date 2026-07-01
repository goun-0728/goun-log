import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import HomeStats from "@/components/HomeStats";
import { formatDate, getArticleThumbnailUrl } from "@/lib/article-shared";
import { getPublishedArticles } from "@/lib/articles";
import { getVisitStats } from "@/lib/visits";

export const revalidate = 60;

const generatorUrl = "https://food-detail-generator.vercel.app/";

export default async function Home() {
  const [articles, stats] = await Promise.all([getPublishedArticles(), getVisitStats()]);
  const latestArticles = articles.slice(0, 3);
  const displayStats = {
    ...stats,
    published: stats.published || articles.length,
  };

  return (
    <main className="home-page">

      {/* ① 도구 바로가기 */}
      <section className="home-tools" aria-labelledby="tools-title">
        <div className="home-tools-list">
          <p className="home-eyebrow">Tools</p>
          <h2 id="tools-title">필요한 도구를 바로 사용해보세요.</h2>
          <div className="home-tools-buttons">
            <a href={generatorUrl} target="_blank" rel="noopener noreferrer" className="home-tools-btn">
              AI 상세페이지 생성기 →
            </a>
            <Link href="/tools/delivery-notice" target="_blank" rel="noopener noreferrer" className="home-tools-btn">
              택배 공지 생성기 →
            </Link>
          </div>
        </div>
        <div className="home-tools-items">
          {[
            { icon: "○", title: "AI로 빠르게 제작", desc: "상품 정보만 입력하면 AI가 상세페이지 초안을 자동 생성합니다." },
            { icon: "◇", title: "직접 편집 가능", desc: "생성된 내용을 원하는 대로 수정하고 다듬을 수 있습니다." },
            { icon: "△", title: "간편한 저장", desc: "완성된 상세페이지를 PNG로 저장해 바로 사용하세요." },
            { icon: "□", title: "계속 업데이트", desc: "택배 공지 등 셀러에게 필요한 도구를 계속 추가하고 있습니다." },
          ].map((item) => (
            <div key={item.title} className="home-tools-item">
              <span className="home-tools-icon">{item.icon}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
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
