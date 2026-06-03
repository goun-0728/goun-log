import type { Metadata } from "next";
import Link from "next/link";
import { collectNewsAction, createNewsDraftAction, ignoreNewsAction } from "@/app/admin/news/actions";
import { formatDate } from "@/lib/articles";
import { requireAdmin } from "@/lib/auth";
import { getCollectedNews, type CollectedNews, type NewsStatus } from "@/lib/news";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "기사 수집 | GOUN LOG",
};

const statusLabels: Record<NewsStatus, string> = {
  collected: "수집됨",
  drafted: "초안 생성됨",
  ignored: "무시됨",
};

const errorMessages: Record<string, string> = {
  "collect-failed": "기사 수집에 실패했습니다. 네이버 API 환경변수와 DB 테이블을 확인해주세요.",
  "draft-failed": "초안 생성에 실패했습니다. articles 테이블과 slug 중복 여부를 확인해주세요.",
  "ignore-failed": "기사 무시 처리에 실패했습니다.",
  "load-failed": "수집 기사 목록을 불러오지 못했습니다. Supabase 테이블 생성 여부를 확인해주세요.",
};

type PageProps = {
  searchParams: Promise<{
    status?: string;
    result?: string;
    error?: string;
    found?: string;
    inserted?: string;
    skipped?: string;
  }>;
};

function getStatusFilter(value?: string): NewsStatus | "all" {
  if (value === "drafted" || value === "ignored" || value === "collected") return value;
  return "all";
}

function getResultMessage(params: Awaited<PageProps["searchParams"]>) {
  if (params.result === "collected") {
    return `수집 완료: 검색 ${params.found || 0}건, 신규 저장 ${params.inserted || 0}건, 중복 제외 ${params.skipped || 0}건`;
  }
  if (params.result === "drafted") return "GOUN LOG 초안이 draft 상태로 생성되었습니다.";
  if (params.result === "ignored") return "선택한 기사를 무시 처리했습니다.";
  return "";
}

export default async function AdminNewsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const status = getStatusFilter(params.status);
  const resultMessage = getResultMessage(params);
  let news: CollectedNews[] = [];
  let loadError = "";

  try {
    news = await getCollectedNews(status);
  } catch (error) {
    console.error("Load collected news failed.", error);
    loadError = "load-failed";
  }

  return (
    <main className="admin-page admin-news-page">
      <Link href="/admin" className="back-link">
        관리자 홈
      </Link>

      <div className="admin-topbar">
        <div>
          <p className="eyebrow">News Collector</p>
          <h1>기사 수집</h1>
          <p className="muted-copy">국내 쇼핑/이커머스 관련 기사만 수집하고, AI 요약 초안을 draft로 만듭니다.</p>
        </div>
        <form action={collectNewsAction}>
          <button type="submit" className="admin-primary-button">
            기사 수집 실행
          </button>
        </form>
      </div>

      {params.error || loadError ? <p className="admin-error">{errorMessages[params.error || loadError] || "오류가 발생했습니다."}</p> : null}
      {resultMessage ? <p className="admin-success">{resultMessage}</p> : null}

      <div className="news-filter-tabs" aria-label="기사 상태 필터">
        <Link href="/admin/news" className={status === "all" ? "is-active" : ""}>
          전체
        </Link>
        <Link href="/admin/news?status=collected" className={status === "collected" ? "is-active" : ""}>
          수집됨
        </Link>
        <Link href="/admin/news?status=drafted" className={status === "drafted" ? "is-active" : ""}>
          초안 생성됨
        </Link>
        <Link href="/admin/news?status=ignored" className={status === "ignored" ? "is-active" : ""}>
          무시됨
        </Link>
      </div>

      <section className="news-admin-list">
        {news.map((item) => (
          <article key={item.id} className="news-admin-item">
            <div className="news-admin-meta">
              <span>{item.source_name || "출처 미확인"}</span>
              <span>{item.keyword}</span>
              <span>{formatDate(item.published_at || item.created_at)}</span>
              <span>{statusLabels[item.status]}</span>
            </div>
            <h2>{item.original_title}</h2>
            <a href={item.original_url} target="_blank" rel="noopener noreferrer" className="news-original-link">
              원문 링크 열기
            </a>
            <div className="news-summary-grid">
              <div>
                <h3>AI 요약</h3>
                <p>{item.summary || "요약이 없습니다."}</p>
              </div>
              <div>
                <h3>온라인 판매자 관점</h3>
                <p>{item.ai_comment || "코멘트가 없습니다."}</p>
              </div>
            </div>
            <div className="admin-submit-actions">
              <form action={createNewsDraftAction.bind(null, item.id)}>
                <button type="submit" className="admin-primary-button" disabled={item.status === "drafted"}>
                  GOUN LOG 초안 만들기
                </button>
              </form>
              <form action={ignoreNewsAction.bind(null, item.id)}>
                <button type="submit" className="admin-secondary-button" disabled={item.status === "ignored"}>
                  무시
                </button>
              </form>
            </div>
          </article>
        ))}
        {!news.length ? <p className="empty-state">수집된 기사가 없습니다. 먼저 기사 수집을 실행해주세요.</p> : null}
      </section>
    </main>
  );
}
