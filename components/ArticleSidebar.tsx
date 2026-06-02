import Link from "next/link";
import type { Article } from "@/lib/articles";
import { formatDate } from "@/lib/articles";

export default function ArticleSidebar({ recentArticles }: { recentArticles: Article[] }) {
  return (
    <aside className="site-sidebar">
      <section className="sidebar-block">
        <h2>인기글</h2>
        <div className="recent-list">
          {recentArticles.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`}>
              <span>{article.title}</span>
              <time>{formatDate(article.published_at || article.created_at)}</time>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}
