import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ArticleStatus = "draft" | "published";

export type Article = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  image_url: string | null;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ArticleInput = {
  title: string;
  slug: string;
  description: string | null;
  content: string;
  image_url: string | null;
  status: ArticleStatus;
  published_at: string | null;
};

export const sampleArticles: Article[] = [
  {
    id: "sample-detail-page",
    title: "우리는 언제까지 상세페이지에 목을 매야 할까?",
    slug: "detail-page",
    description:
      "상세페이지는 여전히 중요하지만 모든 문제의 답은 아닙니다. 고객이 실제로 구매를 결정하는 지점을 다시 살펴봅니다.",
    content:
      "## 상세페이지는 여전히 중요합니다\n\n상세페이지는 고객이 상품을 이해하고 구매를 판단하는 핵심 공간입니다. 하지만 모든 문제를 상세페이지 하나로 해결하려고 하면 중요한 질문을 놓치기 쉽습니다.\n\n고객은 상세페이지를 보기 전에 이미 가격, 리뷰, 대표이미지, 배송 조건, 브랜드 인상까지 함께 보고 있습니다.\n\n## 고객의 구매 여정을 봐야 합니다\n\n판매가 막혔을 때는 상세페이지 문구만 고치기보다 고객이 처음 상품을 만나는 지점을 함께 봐야 합니다.\n\n- 검색 결과에서 보이는 상품명\n- 첫 화면의 대표이미지\n- 리뷰의 양과 신뢰도\n- 가격과 선택지의 균형\n- 상세페이지에서 확인하는 확신\n\n상세페이지는 마지막 설득 공간입니다. 그 앞의 흐름까지 함께 설계할 때 더 강하게 작동합니다.",
    image_url: null,
    status: "published",
    published_at: "2026-06-01T00:00:00.000Z",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "sample-ad-budget",
    title: "광고비를 늘리는 것이 답일까?",
    slug: "ad-budget",
    description:
      "광고비 증액은 매출을 올리는 빠른 방법처럼 보이지만, 먼저 확인해야 할 숫자들이 있습니다.",
    content:
      "## 광고비를 늘리기 전에\n\n광고비를 늘리면 노출과 유입은 늘어날 수 있습니다. 하지만 전환 구조가 준비되지 않은 상태라면 비용만 빠르게 소진될 수 있습니다.\n\n먼저 봐야 할 것은 광고비 자체가 아니라 광고가 데려온 고객이 어디에서 이탈하는지입니다.\n\n## 먼저 확인할 숫자\n\n- 클릭률\n- 상세페이지 체류와 이탈\n- 장바구니 전환\n- 구매 전환율\n- 객단가와 마진\n\n광고는 문제를 푸는 만능 도구가 아닙니다. 이미 작동하는 구조를 확장하는 도구에 가깝습니다.",
    image_url: null,
    status: "published",
    published_at: "2026-05-30T00:00:00.000Z",
    created_at: "2026-05-30T00:00:00.000Z",
    updated_at: "2026-05-30T00:00:00.000Z",
  },
  {
    id: "sample-customer-future",
    title: "고객은 상품을 사는 것이 아니라 미래를 산다.",
    slug: "customer-future",
    description: "고객은 상품 자체보다 그 상품을 통해 얻게 될 변화와 미래를 구매합니다.",
    content:
      "## 고객이 기대하는 변화\n\n고객은 상품의 성분이나 스펙만 보고 움직이지 않습니다. 그 상품을 사용한 뒤 자신의 생활이 어떻게 달라질지 상상할 때 구매에 가까워집니다.\n\n그래서 좋은 판매 문구는 상품 설명에서 끝나지 않고 고객의 다음 장면을 보여줍니다.\n\n## 미래를 보여주는 방식\n\n- 사용 전의 불편함을 구체적으로 짚기\n- 사용 후의 변화된 장면 보여주기\n- 고객의 언어로 기대감을 표현하기\n\n상품은 물건이지만 구매 결정은 변화에 대한 믿음에서 시작합니다.",
    image_url: null,
    status: "published",
    published_at: "2026-05-28T00:00:00.000Z",
    created_at: "2026-05-28T00:00:00.000Z",
    updated_at: "2026-05-28T00:00:00.000Z",
  },
  {
    id: "sample-ai-detail-page",
    title: "AI가 상세페이지를 대신 만들 수 있을까?",
    slug: "ai-detail-page",
    description:
      "AI는 상세페이지 제작을 빠르게 도와줄 수 있지만, 고객 이해와 판매 전략까지 대신해주지는 않습니다.",
    content:
      "## AI가 잘하는 것\n\nAI는 초안 작성, 문구 변형, 구조 정리처럼 반복적인 작업에서 시간을 줄여줍니다. 특히 상품 특징을 여러 관점으로 풀어내는 데 강점이 있습니다.\n\n하지만 AI가 만든 결과를 그대로 올리기보다 판매자가 알고 있는 고객 맥락을 더해야 합니다.\n\n## 사람이 결정해야 하는 것\n\n- 어떤 고객을 우선 설득할지\n- 어떤 장점을 가장 앞에 둘지\n- 어떤 불안을 먼저 해소할지\n- 브랜드의 말투를 어떻게 잡을지\n\nAI는 시작 속도를 높여주는 도구입니다. 방향을 정하는 일은 여전히 사람의 몫입니다.",
    image_url: null,
    status: "published",
    published_at: "2026-05-26T00:00:00.000Z",
    created_at: "2026-05-26T00:00:00.000Z",
    updated_at: "2026-05-26T00:00:00.000Z",
  },
  {
    id: "sample-smartstore-basic",
    title: "스마트스토어에서 무엇이 중요할까?",
    slug: "smartstore-basic",
    description:
      "스마트스토어 운영에서 상품명, 대표이미지, 리뷰, 가격, 광고보다 먼저 봐야 할 기본 구조를 정리합니다.",
    content:
      "## 기본 구조가 먼저입니다\n\n스마트스토어에서는 하나의 요소만 좋아도 판매가 안정되기 어렵습니다. 상품명, 대표이미지, 가격, 리뷰, 상세페이지가 함께 맞물려야 합니다.\n\n처음에는 화려한 전략보다 기본 구조를 점검하는 것이 더 중요합니다.\n\n## 먼저 확인할 항목\n\n- 검색에 맞는 상품명인지\n- 대표이미지가 클릭을 부르는지\n- 가격과 선택지가 납득되는지\n- 리뷰가 신뢰를 주는지\n- 상세페이지가 구매 불안을 줄이는지\n\n기본이 정리되면 광고와 콘텐츠의 효과도 더 선명하게 보입니다.",
    image_url: null,
    status: "published",
    published_at: "2026-05-24T00:00:00.000Z",
    created_at: "2026-05-24T00:00:00.000Z",
    updated_at: "2026-05-24T00:00:00.000Z",
  },
];

export function formatDate(date: string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export async function getPublishedArticles(limit?: number) {
  noStore();
  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) return sampleArticles.slice(0, limit || sampleArticles.length);
    const articles = (data || []) as Article[];
    return articles.length ? articles : sampleArticles.slice(0, limit || sampleArticles.length);
  } catch {
    return sampleArticles.slice(0, limit || sampleArticles.length);
  }
}

export async function getPopularArticles(limit = 5) {
  noStore();
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("view_count", { ascending: false, nullsFirst: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (!error && data?.length) return data as Article[];
  } catch {
    // Some v1 tables do not have view_count yet. Fall back to latest published articles.
  }

  return getPublishedArticles(limit);
}

export async function getPublishedArticleBySlug(slug: string) {
  noStore();
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) return sampleArticles.find((article) => article.slug === slug) || null;
    return data as Article;
  } catch {
    return sampleArticles.find((article) => article.slug === slug) || null;
  }
}

export async function getAdminArticles() {
  noStore();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Article[];
}

export async function getAdminArticle(id: string) {
  noStore();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();

  if (error) return null;
  return data as Article;
}

export async function createArticle(input: ArticleInput) {
  const supabase = getSupabaseAdmin();
  const publishedAt = input.status === "published" && !input.published_at ? new Date().toISOString() : input.published_at;
  const { error } = await supabase.from("articles").insert({ ...input, published_at: publishedAt });
  if (error) throw error;
}

export async function updateArticle(id: string, input: ArticleInput) {
  const supabase = getSupabaseAdmin();
  const publishedAt = input.status === "published" && !input.published_at ? new Date().toISOString() : input.published_at;
  const { error } = await supabase
    .from("articles")
    .update({ ...input, published_at: publishedAt, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteArticle(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw error;
}
