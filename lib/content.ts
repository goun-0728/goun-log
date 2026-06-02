import { markdownToHtml } from "@/lib/markdown";

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function sanitizeHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(?:src|href)=(["'])\s*javascript:[\s\S]*?\1/gi, "")
    .replace(/<img([^>]*?)src=(["'])\s*\2([^>]*?)>/gi, "")
    .replace(/<img([^>]*?)src=(["'])(?!https?:\/\/|\/|data:image\/(?:png|jpeg|jpg|webp);base64,)(.*?)\2([^>]*?)>/gi, "");
}

export function renderArticleContent(content: string) {
  const safeContent = content || "";
  const html = looksLikeHtml(safeContent) ? safeContent : markdownToHtml(safeContent);
  return sanitizeHtml(html);
}
