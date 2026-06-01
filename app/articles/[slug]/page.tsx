import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getArticle, getArticles, markdownToHtml } from "@/lib/articles";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getArticles().map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
      images: [article.ogImage || "/og-default.svg"],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-8 sm:px-6 sm:pb-28 sm:pt-12">
      <article className="max-w-[680px]">
        <Link href="/" className="mb-12 inline-block text-[14px] text-neutral-500 transition-colors hover:text-neutral-950">
          홈으로
        </Link>
        <header className="mb-12 border-b border-neutral-200 pb-9">
          <h1 className="mb-5 text-[31px] font-semibold leading-tight tracking-normal sm:text-[42px]">
            {article.title}
          </h1>
          <time className="text-[14px] text-neutral-500">{formatDate(article.date)}</time>
        </header>
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }}
        />
      </article>
    </main>
  );
}
