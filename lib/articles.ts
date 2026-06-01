import fs from "node:fs";
import path from "node:path";

export type ArticleMeta = {
  title: string;
  date: string;
  description: string;
  ogImage?: string;
};

export type Article = ArticleMeta & {
  slug: string;
  content: string;
};

const articlesDirectory = path.join(process.cwd(), "articles");

function parseFrontmatter(fileContent: string): { meta: ArticleMeta; content: string } {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    throw new Error("Article markdown must include frontmatter.");
  }

  const meta = match[1].split("\n").reduce<Record<string, string>>((acc, line) => {
    const index = line.indexOf(":");
    if (index === -1) return acc;

    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^"|"$/g, "");
    acc[key] = value;
    return acc;
  }, {});

  return {
    meta: {
      title: meta.title,
      date: meta.date,
      description: meta.description,
      ogImage: meta.ogImage,
    },
    content: match[2].trim(),
  };
}

export function getArticles(): Article[] {
  const files = fs.readdirSync(articlesDirectory);

  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const filePath = path.join(articlesDirectory, file);
      const { meta, content } = parseFrontmatter(fs.readFileSync(filePath, "utf8"));

      return {
        slug,
        ...meta,
        content,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getArticle(slug: string): Article | undefined {
  return getArticles().find((article) => article.slug === slug);
}

export function formatDate(date: string): string {
  return date.replaceAll("-", ".");
}

function inlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    html.push(`<ul>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed === "---") {
      flushParagraph();
      flushList();
      html.push("<hr />");
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      html.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      html.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      listItems.push(trimmed.slice(2));
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return html.join("\n");
}
