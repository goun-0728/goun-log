import Link from "next/link";
import { deleteArticleAction, logoutAction } from "@/app/admin/actions";
import AdminDeleteButton from "@/components/AdminDeleteButton";
import { requireAdmin } from "@/lib/auth";
import { formatDate, getAdminArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const email = await requireAdmin();
  const articles = await getAdminArticles();

  return (
    <main className="admin-page">
      <div className="admin-topbar">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>글 관리</h1>
          <p className="muted-copy">{email}</p>
        </div>
        <div className="admin-actions">
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

      <div className="admin-table">
        <div className="admin-table-header">
          <span>제목</span>
          <span>슬러그</span>
          <span>상태</span>
          <span>발행일</span>
          <span>관리</span>
        </div>
        {articles.map((article) => (
          <div key={article.id} className="admin-table-row">
            <div className="admin-title-cell">
              <strong>{article.title}</strong>
              <span>{article.description}</span>
            </div>
            <span>{article.slug}</span>
            <span>{article.status}</span>
            <span>{formatDate(article.published_at || article.created_at)}</span>
            <div className="admin-row-actions">
              <Link href={`/admin/articles/${article.id}/edit`}>수정</Link>
              <form action={deleteArticleAction.bind(null, article.id)}>
                <AdminDeleteButton />
              </form>
            </div>
          </div>
        ))}
        {!articles.length ? <p className="empty-state">등록된 글이 없습니다.</p> : null}
      </div>
    </main>
  );
}
