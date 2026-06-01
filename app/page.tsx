import ArticleList from "@/components/ArticleList";
import ArticleSidebar from "@/components/ArticleSidebar";
import HeroTicker from "@/components/HeroTicker";
import HomeStats from "@/components/HomeStats";
import { getPublishedArticles } from "@/lib/articles";
import { getVisitStats, recordVisit } from "@/lib/visits";

export const dynamic = "force-dynamic";

export default async function Home() {
  await recordVisit("/");
  const [articles, recentArticles, stats] = await Promise.all([
    getPublishedArticles(),
    getPublishedArticles(5),
    getVisitStats(),
  ]);

  return (
    <main>
      <HeroTicker />
      <div className="home-stats-wrap">
        <HomeStats stats={stats} />
      </div>
      <div className="page-grid">
        <section className="content-column" aria-labelledby="latest-posts">
          <div className="section-heading">
            <span>Archive</span>
            <h2 id="latest-posts">최신 글</h2>
          </div>
          <ArticleList articles={articles} />
        </section>
        <ArticleSidebar recentArticles={recentArticles} stats={stats} />
      </div>
    </main>
  );
}
