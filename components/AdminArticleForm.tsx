import type { Article } from "@/lib/articles";

export default function AdminArticleForm({
  action,
  article,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  article?: Article;
  submitLabel: string;
}) {
  const publishedAt = article?.published_at ? article.published_at.slice(0, 16) : "";

  return (
    <form action={action} className="admin-form">
      <label>
        <span>제목</span>
        <input name="title" defaultValue={article?.title || ""} required />
      </label>
      <label>
        <span>슬러그</span>
        <input name="slug" defaultValue={article?.slug || ""} required />
      </label>
      <label>
        <span>요약</span>
        <textarea name="description" rows={3} defaultValue={article?.description || ""} />
      </label>
      <label>
        <span>본문</span>
        <textarea name="content" rows={18} defaultValue={article?.content || ""} required />
      </label>
      <label>
        <span>대표이미지 URL</span>
        <input name="image_url" type="url" defaultValue={article?.image_url || ""} placeholder="https://..." />
      </label>
      <div className="admin-form-grid">
        <label>
          <span>상태</span>
          <select name="status" defaultValue={article?.status || "draft"}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
        <label>
          <span>발행일</span>
          <input name="published_at" type="datetime-local" defaultValue={publishedAt} />
        </label>
      </div>
      <button type="submit" className="admin-primary-button">
        {submitLabel}
      </button>
    </form>
  );
}
