import type { Metadata } from "next";
import ArticleList from "@/components/ArticleList";
import ArticleSidebar from "@/components/ArticleSidebar";
import { getPopularArticles, getPublishedArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "아카이브",
  description: "GOUN LOG에 기록한 온라인 판매와 마케팅 글 목록입니다.",
};

export default async function ArchivePage() {
  const [articles, popularArticles] = await Promise.all([
    getPublishedArticles(),
    getPopularArticles(5),
  ]);

  return (
    <main className="page-grid archive-page">
      <section className="content-column" aria-labelledby="archive-title">
        <div className="section-heading">
          <span>Archive</span>
          <h1 id="archive-title">아카이브</h1>
        </div>
        <ArticleList articles={articles} />
      </section>
      <ArticleSidebar recentArticles={popularArticles} />
    </main>
  );
}
