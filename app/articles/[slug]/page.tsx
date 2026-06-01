import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleSidebar from "@/components/ArticleSidebar";
import { formatDate, getPublishedArticleBySlug, getPublishedArticles } from "@/lib/articles";
import { markdownToHtml } from "@/lib/markdown";
import { recordVisit } from "@/lib/visits";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) return {};

  return {
    title: article.title,
    description: article.description || undefined,
    openGraph: {
      title: article.title,
      description: article.description || undefined,
      type: "article",
      publishedTime: article.published_at || undefined,
      images: article.image_url ? [article.image_url] : ["/og-default.svg"],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  await recordVisit(`/articles/${slug}`);

  const [article, recentArticles] = await Promise.all([
    getPublishedArticleBySlug(slug),
    getPublishedArticles(5),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <main className="page-grid article-page-grid">
      <article className="article-detail">
        <Link href="/" className="back-link">
          홈으로
        </Link>
        <header className="article-header">
          <h1>{article.title}</h1>
          <time>{formatDate(article.published_at || article.created_at)}</time>
          {article.image_url ? (
            <div className="article-hero-image">
              <img src={article.image_url} alt="" />
            </div>
          ) : null}
        </header>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }} />
      </article>
      <ArticleSidebar recentArticles={recentArticles} />
    </main>
  );
}
