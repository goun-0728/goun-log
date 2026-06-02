"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/articles";
import { formatDate, getArticleThumbnailUrl } from "@/lib/articles";

function matchesSearch(article: Article, query: string) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return true;

  return [article.title, article.description || "", article.content]
    .join(" ")
    .toLowerCase()
    .includes(keyword);
}

export default function ArticleList({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const filteredArticles = useMemo(
    () => articles.filter((article) => matchesSearch(article, query)),
    [articles, query],
  );

  if (!articles.length) {
    return <p className="empty-state">아직 발행된 글이 없습니다.</p>;
  }

  return (
    <>
      <div className="article-search" role="search">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="검색어를 입력하세요"
          aria-label="글 검색"
        />
        <button type="button" aria-label="검색">
          검색
        </button>
      </div>

      {filteredArticles.length ? (
        <div className="article-list">
          {filteredArticles.map((article) => {
            const thumbnailUrl = getArticleThumbnailUrl(article);

            return (
              <article key={article.id} className={`article-list-item${thumbnailUrl ? "" : " article-list-item-no-image"}`}>
                {thumbnailUrl ? (
                  <Link href={`/articles/${article.slug}`} className="article-thumb" aria-label={`${article.title} 보기`}>
                    <img src={thumbnailUrl} alt="" />
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
            );
          })}
        </div>
      ) : (
        <p className="empty-state">검색 결과가 없습니다.</p>
      )}
    </>
  );
}
