import { unstable_noStore as noStore } from "next/cache";
import { createArticle } from "@/lib/articles";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type NewsStatus = "collected" | "drafted" | "ignored";

export type NewsSource = {
  id?: string;
  name: string;
  keyword: string;
  is_active: boolean;
  created_at?: string | null;
};

export type CollectedNews = {
  id: string;
  source_name: string | null;
  keyword: string;
  original_title: string;
  original_url: string;
  published_at: string | null;
  summary: string | null;
  ai_comment: string | null;
  status: NewsStatus;
  created_at: string | null;
};

type NaverNewsItem = {
  title?: string;
  originallink?: string;
  link?: string;
  description?: string;
  pubDate?: string;
};

type NaverNewsResponse = {
  items?: NaverNewsItem[];
};

type SummaryResult = {
  summary: string;
  aiComment: string;
};

export const DEFAULT_NEWS_SOURCES: NewsSource[] = [
  { name: "네이버 쇼핑", keyword: "네이버 쇼핑", is_active: true },
  { name: "스마트스토어", keyword: "스마트스토어", is_active: true },
  { name: "네이버 광고", keyword: "네이버 광고", is_active: true },
  { name: "쿠팡", keyword: "쿠팡", is_active: true },
  { name: "쿠팡 판매자", keyword: "쿠팡 판매자", is_active: true },
  { name: "G마켓", keyword: "G마켓", is_active: true },
  { name: "11번가", keyword: "11번가", is_active: true },
  { name: "카카오쇼핑", keyword: "카카오쇼핑", is_active: true },
  { name: "SSG닷컴", keyword: "SSG닷컴", is_active: true },
  { name: "컬리", keyword: "컬리", is_active: true },
  { name: "오늘의집", keyword: "오늘의집", is_active: true },
  { name: "이커머스", keyword: "이커머스", is_active: true },
  { name: "온라인 쇼핑", keyword: "온라인 쇼핑", is_active: true },
  { name: "오픈마켓", keyword: "오픈마켓", is_active: true },
  { name: "쇼핑몰 판매자", keyword: "쇼핑몰 판매자", is_active: true },
  { name: "AI 커머스", keyword: "AI 커머스", is_active: true },
  { name: "라이브커머스", keyword: "라이브커머스", is_active: true },
];

function stripHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function safeDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function getSourceName(url: string, fallback: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host || fallback;
  } catch {
    return fallback;
  }
}

function makeDraftSlug(id: string) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `news-${date}-${id.slice(0, 8)}`;
}

function buildDraftContent(news: CollectedNews) {
  const summary = news.summary || "요약 내용이 없습니다. 원문 링크를 확인한 뒤 내용을 보완해주세요.";
  const aiComment = news.ai_comment || "온라인 판매자 관점의 메모를 추가해주세요.";

  return `<h2>원문 기사 요약</h2>
<p>${summary.replace(/\n/g, "<br />")}</p>

<h2>온라인 판매자 관점에서 볼 점</h2>
<p>${aiComment.replace(/\n/g, "<br />")}</p>

<h2>GOUN LOG 메모</h2>
<p>관리자 확인 후 의견을 추가하세요.</p>

<p>출처: <a href="${news.original_url}" target="_blank" rel="noopener noreferrer">${news.source_name || "원문 기사"}</a></p>`;
}

async function getActiveNewsSources() {
  const supabase = getSupabaseAdmin();

  try {
    const { data, error } = await supabase
      .from("news_sources")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (!error && data?.length) return data as NewsSource[];
  } catch {
    // If the table is not seeded yet, use the built-in source list.
  }

  return DEFAULT_NEWS_SOURCES;
}

async function fetchNaverNews(keyword: string) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("NAVER_ENV_MISSING");
  }

  const display = Number(process.env.NEWS_ITEMS_PER_KEYWORD || 3);
  const params = new URLSearchParams({
    query: keyword,
    display: String(Math.max(1, Math.min(display, 10))),
    start: "1",
    sort: "date",
  });

  const response = await fetch(`https://openapi.naver.com/v1/search/news.json?${params.toString()}`, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`NAVER_REQUEST_FAILED_${response.status}`);
  }

  const data = (await response.json()) as NaverNewsResponse;
  return data.items || [];
}

async function summarizeNews(input: {
  title: string;
  snippet: string;
  keyword: string;
  sourceName: string;
  originalUrl: string;
}): Promise<SummaryResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return {
      summary: `${input.title}\n${input.snippet || "검색 결과 요약문을 확인한 뒤 내용을 보완해주세요."}`,
      aiComment: "OPENAI_API_KEY가 설정되면 온라인 판매자 관점의 AI 코멘트가 자동 생성됩니다.",
    };
  }

  const prompt = `다음 뉴스 검색 결과를 바탕으로 원문 전문을 복사하지 말고 한국어로 요약해줘.

조건:
- 요약은 3~5줄
- 원문 문장을 길게 그대로 복사하지 말 것
- 온라인 쇼핑몰/오픈마켓 판매자가 볼 포인트를 2~3줄로 따로 정리
- 과장하지 말고 검색 결과에 있는 정보만 사용

키워드: ${input.keyword}
출처: ${input.sourceName}
제목: ${input.title}
검색 요약: ${input.snippet}
원문 링크: ${input.originalUrl}

JSON 형식으로만 응답:
{
  "summary": "요약",
  "aiComment": "온라인 판매자 관점"
}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "너는 국내 이커머스 뉴스를 온라인 판매자 관점으로 짧게 요약하는 편집자다.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error(`OPENAI_REQUEST_FAILED_${response.status}`);

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(content) as { summary?: string; aiComment?: string };

    return {
      summary: stripHtml(parsed.summary || input.snippet || input.title),
      aiComment: stripHtml(parsed.aiComment || "판매자 관점의 추가 검토가 필요합니다."),
    };
  } catch (error) {
    console.error("News summary failed.", error);
    return {
      summary: `${input.title}\n${input.snippet || "검색 결과 요약문을 확인한 뒤 내용을 보완해주세요."}`,
      aiComment: "AI 요약 생성에 실패했습니다. 관리자 확인 후 내용을 보완해주세요.",
    };
  }
}

export async function getCollectedNews(status?: NewsStatus | "all") {
  noStore();
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("collected_news")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as CollectedNews[];
}

export async function collectShoppingNews() {
  const supabase = getSupabaseAdmin();
  const sources = await getActiveNewsSources();
  let found = 0;
  let inserted = 0;
  let skipped = 0;

  for (const source of sources) {
    const items = await fetchNaverNews(source.keyword);

    for (const item of items) {
      const originalUrl = item.originallink || item.link || "";
      const title = stripHtml(item.title || "");
      const snippet = stripHtml(item.description || "");
      if (!originalUrl || !title) continue;

      found += 1;

      const { data: existing } = await supabase
        .from("collected_news")
        .select("id")
        .eq("original_url", originalUrl)
        .maybeSingle();

      if (existing) {
        skipped += 1;
        continue;
      }

      const sourceName = getSourceName(originalUrl, source.name);
      const ai = await summarizeNews({
        title,
        snippet,
        keyword: source.keyword,
        sourceName,
        originalUrl,
      });

      const { error } = await supabase.from("collected_news").insert({
        source_name: sourceName,
        keyword: source.keyword,
        original_title: title,
        original_url: originalUrl,
        published_at: safeDate(item.pubDate),
        summary: ai.summary,
        ai_comment: ai.aiComment,
        status: "collected",
      });

      if (error) {
        if (error.code === "23505") skipped += 1;
        else throw error;
      } else {
        inserted += 1;
      }
    }
  }

  return { found, inserted, skipped };
}

export async function createDraftFromCollectedNews(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("collected_news").select("*").eq("id", id).single();

  if (error || !data) throw error || new Error("NEWS_NOT_FOUND");
  const news = data as CollectedNews;

  await createArticle({
    title: `[기사 요약] ${news.original_title}`,
    slug: makeDraftSlug(news.id),
    description: news.summary?.slice(0, 160) || "국내 쇼핑/이커머스 기사 요약 초안입니다.",
    content: buildDraftContent(news),
    image_url: null,
    status: "draft",
    published_at: null,
  });

  await supabase
    .from("collected_news")
    .update({ status: "drafted" })
    .eq("id", id);
}

export async function ignoreCollectedNews(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("collected_news").update({ status: "ignored" }).eq("id", id);
  if (error) throw error;
}
