import Link from "next/link";
import { formatDate, getArticles } from "@/lib/articles";

export default function Home() {
  const articles = getArticles();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-8 sm:px-6 sm:pb-28 sm:pt-14">
      <section className="mb-16 sm:mb-20">
        <h1 className="mb-4 text-[34px] font-semibold leading-tight tracking-normal sm:text-[48px]">
          GOUN LOG
        </h1>
        <p className="max-w-xl text-[17px] leading-8 text-neutral-600 sm:text-[18px]">
          온라인 판매와 마케팅에 대한 기록
        </p>
      </section>

      <section aria-labelledby="latest-posts">
        <h2 id="latest-posts" className="mb-7 text-[15px] font-semibold text-neutral-950">
          최신 글
        </h2>
        <div className="border-t border-neutral-200">
          {articles.map((article) => (
            <article key={article.slug} className="border-b border-neutral-200 py-8 sm:py-9">
              <time className="mb-3 block text-[14px] text-neutral-500">{formatDate(article.date)}</time>
              <h3 className="mb-3 text-[21px] font-semibold leading-snug sm:text-[24px]">
                <Link href={`/articles/${article.slug}`} className="transition-colors hover:text-neutral-500">
                  {article.title}
                </Link>
              </h3>
              <p className="max-w-2xl text-[15px] leading-8 text-neutral-600 sm:text-[16px]">
                {article.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
