import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ArticleStatus = "draft" | "published" | "scheduled";

export type Article = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  image_url: string | null;
  thumbnail_url?: string | null;
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

export function formatDate(date: string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export function getArticleThumbnailUrl(article: Pick<Article, "image_url" | "thumbnail_url">) {
  return article.image_url || article.thumbnail_url || null;
}

export function getStatusLabel(status: ArticleStatus) {
  if (status === "published") return "발행";
  if (status === "scheduled") return "예약발행";
  return "임시저장";
}

async function publishDueScheduledArticles() {
  try {
    const supabase = getSupabaseAdmin();
    await supabase
      .from("articles")
      .update({ status: "published", updated_at: new Date().toISOString() })
      .eq("status", "scheduled")
      .lte("published_at", new Date().toISOString());
  } catch {
    // Public pages should keep rendering even if Supabase is temporarily unavailable.
  }
}

export async function getPublishedArticles(limit?: number) {
  noStore();
  try {
    await publishDueScheduledArticles();
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) return [];
    return (data || []) as Article[];
  } catch {
    return [];
  }
}

export async function getPopularArticles(limit = 5) {
  noStore();
  try {
    await publishDueScheduledArticles();
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
    await publishDueScheduledArticles();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) return null;
    return data as Article;
  } catch {
    return null;
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
