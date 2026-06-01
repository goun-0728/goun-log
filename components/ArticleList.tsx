import Link from "next/link";
import type { Article } from "@/lib/articles";
import { formatDate } from "@/lib/articles";

export default function ArticleList({ articles }: { articles: Article[] }) {
  if (!articles.length) {
    return <p className="empty-state">아직 발행된 글이 없습니다.</p>;
  }

  return (
    <div className="article-list">
      {articles.map((article) => (
        <article key={article.id} className="article-list-item">
          {article.image_url ? (
            <Link href={`/articles/${article.slug}`} className="article-thumb" aria-label={`${article.title} 보기`}>
              <img src={article.image_url} alt="" />
            </Link>
          ) : null}
          <div className="article-list-copy">
            <time>{formatDate(article.published_at || article.created_at)}</time>
            <h2>
              <Link href={`/articles/${article.slug}`}>{article.title}</Link>
            </h2>
            {article.description ? <p>{article.description}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
