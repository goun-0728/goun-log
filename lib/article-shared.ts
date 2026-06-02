export type ArticleImageFields = {
  image_url?: string | null;
  thumbnail_url?: string | null;
};

export function formatDate(date: string | null | undefined) {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export function isSafeImageUrl(value: string | null | undefined) {
  if (!value) return false;
  const url = value.trim();
  if (!url) return false;
  if (url.startsWith("/")) return true;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function getArticleThumbnailUrl(article: ArticleImageFields) {
  const url = article.image_url || article.thumbnail_url || null;
  return isSafeImageUrl(url) ? url?.trim() || null : null;
}

export function getStatusLabel(status: string | null | undefined) {
  if (status === "published") return "발행";
  if (status === "scheduled") return "예약 발행";
  return "임시 저장";
}
