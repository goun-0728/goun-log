import Link from "next/link";
import { deleteArticleAction, logoutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { formatDate, getAdminArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const email = await requireAdmin();
  const articles = await getAdminArticles();
  const scheduledCount = articles.filter((article) => article.status === "scheduled").length;
  const { notice } = await searchParams;

  return (
    <main className="admin-page">
      <div className="admin-topbar">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>글 관리</h1>
          <p className="muted-copy">
            {email} · 예약 글 {scheduledCount}개
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/news" className="admin-secondary-button">
            기사 수집
          </Link>
          <Link href="/admin/articles/new" className="admin-primary-link">
            새 글 작성
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="admin-secondary-button">
              로그아웃
            </button>
          </form>
        </div>
      </div>

      {notice ? <p className="admin-error">{notice}</p> : null}

      <div className="admin-table">
        {articles.map((article) => (
          <div key={article.id} className="admin-table-row">
            <div>
              <strong>{article.title}</strong>
              <span>
                {article.status} · {formatDate(article.published_at || article.created_at)}
              </span>
            </div>
            <div className="admin-row-actions">
              <Link href={`/admin/articles/${article.id}/edit`}>수정</Link>
              <form action={deleteArticleAction.bind(null, article.id)}>
                <button type="submit">삭제</button>
              </form>
            </div>
          </div>
        ))}
        {!articles.length ? <p className="empty-state">등록된 글이 없습니다.</p> : null}
      </div>
    </main>
  );
}
