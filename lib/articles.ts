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
    if (error) return [];
    return (data || []) as Article[];
  } catch {
    return [];
  }
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
