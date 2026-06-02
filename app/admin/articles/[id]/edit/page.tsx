import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateArticleAction } from "@/app/admin/actions";
import AdminArticleForm from "@/components/AdminArticleForm";
import { requireAdmin } from "@/lib/auth";
import { getAdminArticle } from "@/lib/articles";

export const metadata: Metadata = {
  title: "글 수정 | GOUN LOG",
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditArticlePage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;
  const article = await getAdminArticle(id);

  if (!article) notFound();

  return (
    <main className="admin-page">
      <Link href="/admin" className="back-link">
        관리자 홈
      </Link>
      <div className="admin-editor-heading">
        <p className="eyebrow">Edit Article</p>
        <h1>글 수정</h1>
      </div>
      <AdminArticleForm action={updateArticleAction.bind(null, id)} article={article} submitLabel="저장" uploadError={error} />
    </main>
  );
}
