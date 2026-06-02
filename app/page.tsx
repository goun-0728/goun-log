import ArticleList from "@/components/ArticleList";
import ArticleSidebar from "@/components/ArticleSidebar";
import HeroTicker from "@/components/HeroTicker";
import HomeStats from "@/components/HomeStats";
import { getPopularArticles, getPublishedArticles } from "@/lib/articles";
import { getVisitStats } from "@/lib/visits";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [articles, popularArticles, stats] = await Promise.all([
    getPublishedArticles(),
    getPopularArticles(5),
    getVisitStats(),
  ]);
  const displayStats = {
    ...stats,
    published: stats.published || articles.length,
  };

  return (
    <main>
      <HeroTicker />
      <div className="home-stats-wrap">
        <HomeStats stats={displayStats} />
      </div>
      <div className="page-grid">
        <section className="content-column" aria-labelledby="latest-posts">
          <div className="section-heading">
            <span>Archive</span>
            <h2 id="latest-posts">최신 글</h2>
          </div>
          <ArticleList articles={articles} />
        </section>
        <ArticleSidebar recentArticles={popularArticles} />
      </div>
    </main>
  );
}
