import type { Metadata } from "next";
import Link from "next/link";
import { createArticleAction } from "@/app/admin/actions";
import AdminArticleForm from "@/components/AdminArticleForm";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "새 글 작성",
};

export default async function NewArticlePage() {
  await requireAdmin();

  return (
    <main className="admin-page">
      <Link href="/admin" className="back-link">
        관리자 홈
      </Link>
      <div className="admin-editor-heading">
        <p className="eyebrow">New Article</p>
        <h1>새 글 작성</h1>
      </div>
      <AdminArticleForm action={createArticleAction} submitLabel="저장" />
    </main>
  );
}
