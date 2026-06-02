import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleSidebar from "@/components/ArticleSidebar";
import SafeImage from "@/components/SafeImage";
import { formatDate, getPublishedArticleBySlug, getPublishedArticles } from "@/lib/articles";
import { getArticleThumbnailUrl } from "@/lib/article-shared";
import { renderArticleContent } from "@/lib/content";

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
  const thumbnailUrl = getArticleThumbnailUrl(article);

  return {
    title: article.title,
    description: article.description || undefined,
    openGraph: {
      title: article.title,
      description: article.description || undefined,
      type: "article",
      publishedTime: article.published_at || undefined,
      images: thumbnailUrl ? [thumbnailUrl] : ["/og-default.svg"],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const [article, recentArticles] = await Promise.all([getPublishedArticleBySlug(slug), getPublishedArticles(5)]);

  if (!article) {
    notFound();
  }

  const thumbnailUrl = getArticleThumbnailUrl(article);

  return (
    <main className="page-grid article-page-grid">
      <article className="article-detail">
        <Link href="/" className="back-link">
          홈으로
        </Link>
        <header className="article-header">
          <h1>{article.title}</h1>
          <time>{formatDate(article.published_at || article.created_at)}</time>
          {thumbnailUrl ? (
            <div className="article-hero-image">
              <SafeImage src={thumbnailUrl} alt={article.title} />
            </div>
          ) : null}
        </header>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: renderArticleContent(article.content || "") }} />
      </article>
      <ArticleSidebar recentArticles={recentArticles} />
    </main>
  );
}
