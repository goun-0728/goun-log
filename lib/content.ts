import { markdownToHtml } from "@/lib/markdown";

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function renderArticleContent(content: string) {
  return looksLikeHtml(content) ? content : markdownToHtml(content);
}
