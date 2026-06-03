import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import HomeStats from "@/components/HomeStats";
import { formatDate, getArticleThumbnailUrl } from "@/lib/article-shared";
import { getPublishedArticles } from "@/lib/articles";
import { getVisitStats } from "@/lib/visits";

export const dynamic = "force-dynamic";

const experienceItems = [
  {
    title: "직접 판매하며 검증한 전략",
    description: "이론이 아닌, 실제 해본 과정과 방법을 공유합니다.",
    icon: "○",
  },
  {
    title: "상세페이지 구조 연구",
    description: "판매 흐름을 높이는 구조와 메시지를 계속 연구합니다.",
    icon: "✎",
  },
  {
    title: "광고·마케팅 실전 노하우",
    description: "광고 세팅부터 운영까지, 경험에서 얻은 인사이트를 어렵지 않게 나눕니다.",
    icon: "↗",
  },
  {
    title: "함께 성장하는 파트너",
    description: "정답은 없지만, 함께 고민하며 성장하는 파트너가 되고 싶습니다.",
    icon: "◎",
  },
];

const consultingItems = [
  {
    title: "1:1 맞춤 상담",
    description: "현재 상황을 이야기하고 함께 방향을 잡아가요.",
    icon: "▢",
  },
  {
    title: "실전 교육",
    description: "온라인/오프라인 교육으로 실무에 바로 적용해요.",
    icon: "◇",
  },
  {
    title: "지속적인 소통",
    description: "한 번의 상담으로 끝이 아닌 꾸준한 소통을 지향해요.",
    icon: "∞",
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
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <h1 id="home-title">
            잘 팔리는 구조를 만들면
            <br />
            매출은 달라집니다.
          </h1>
          <p>
            직접 온라인 판매를 하며 부딪히고 배운 것들을
            <br />
            기록하고, 도구로 만들고, 함께 나눕니다.
          </p>

          <div className="hero-cta-grid" aria-label="주요 바로가기">
            <Link href="/tools/detail-page-generator" className="hero-cta-card hero-cta-primary">
              <span className="hero-cta-icon">✳</span>
              <strong>AI 상세페이지 생성기</strong>
              <small>
                상품만 입력하면 AI가
                <br />
                상세페이지 초안을 만들어줘요.
              </small>
              <em>→</em>
            </Link>
            <Link href="/contact" className="hero-cta-card">
              <span className="hero-cta-icon">♧</span>
              <strong>교육·컨설팅 안내</strong>
              <small>
                온라인 판매가 막막할 때,
                <br />
                같이 고민하고 방법을 찾아드려요.
              </small>
              <em>→</em>
            </Link>
          </div>

          <p className="coffee-note">
            <span aria-hidden="true">☕</span>
            커피 한 잔 값으로 완성하는 상세페이지
            <br />
            다운로드 시 2,900원 (고화질 PNG)
          </p>
        </div>

        <div className="hero-preview" aria-label="상세페이지 생성 예시">
          <div className="hero-laptop">
            <div className="hero-product-copy">
              <p>바다의 신선함을 그대로 담았습니다</p>
              <h2>프리미엄 반건조 오징어</h2>
              <span>선명한 비주얼과 자연스러운 메시지 구조</span>
            </div>
            <div className="hero-product-plate" />
            <div className="hero-product-tabs">
              <span>상품 포인트</span>
              <span>추천 대상</span>
              <span>구매 이유</span>
            </div>
          </div>
          <div className="download-badge">
            <span>DOWNLOAD</span>
            <strong>2,900원</strong>
            <small>고화질 PNG</small>
          </div>
        </div>
      </section>

      <section className="home-stats-wrap home-stats-soft" aria-label="사이트 통계">
        <HomeStats stats={displayStats} />
      </section>

      <section className="experience-section" aria-labelledby="experience-title">
        <div className="home-section-heading">
          <h2 id="experience-title">
            GOUN LOG는
            <br />
            직접 경험한 것만 다룹니다.
          </h2>
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
                  {article.description ? <p>{article.description}</p> : null}
                  <time>{formatDate(article.published_at || article.created_at)}</time>
                </div>
              </article>
            );
          })}
          {!latestArticles.length ? <p className="empty-state">아직 발행된 글이 없습니다.</p> : null}
        </div>
      </section>

      <section className="consulting-section" aria-labelledby="consulting-title">
        <div className="consulting-copy">
          <h2 id="consulting-title">혼자 고민하지 마세요.</h2>
          <p>
            온라인 판매에는 정답이 하나가 아니에요.
            <br />
            제가 직접 겪어본 방법 중에서
            <br />
            지금 상황에 맞는 방향을 함께 이야기하고 싶어요.
          </p>
          <Link href="/contact" className="consulting-button">
            교육·컨설팅 문의하기
          </Link>
        </div>
        <div className="consulting-grid">
          {consultingItems.map((item) => (
            <article key={item.title} className="consulting-card">
              <div aria-hidden="true">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
