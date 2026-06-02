"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, getConfiguredAdminEmail, requireAdmin, setAdminSession } from "@/lib/auth";
import {
  createArticle,
  deleteArticle,
  getAdminArticle,
  getArticleThumbnailUrl,
  updateArticle,
  type ArticleInput,
  type ArticleStatus,
} from "@/lib/articles";
import { getSupabaseAuthClient } from "@/lib/supabase/client";
import { deleteArticleThumbnail, ImageUploadError, uploadArticleThumbnail } from "@/lib/storage";

function clean(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

async function parseArticleForm(formData: FormData, currentThumbnailUrl?: string | null): Promise<ArticleInput> {
  const statusValue = clean(formData.get("status")) || "draft";
  const status: ArticleStatus = statusValue === "published" ? "published" : "draft";
  const publishedAtValue = clean(formData.get("published_at"));
  const uploadedThumbnailUrl = await uploadArticleThumbnail(formData.get("thumbnail_file"));

  return {
    title: clean(formData.get("title")) || "",
    slug: clean(formData.get("slug")) || "",
    description: clean(formData.get("description")),
    content: clean(formData.get("content")) || "",
    thumbnail_url: uploadedThumbnailUrl || currentThumbnailUrl || null,
    status,
    published_at: publishedAtValue ? new Date(publishedAtValue).toISOString() : null,
  };
}

export async function loginAction(formData: FormData) {
  const email = (clean(formData.get("email")) || "").toLowerCase();
  const password = clean(formData.get("password")) || "";
  const adminEmail = getConfiguredAdminEmail();

  if (!adminEmail) {
    redirect("/admin/login?error=missing-admin-email");
  }

  if (email !== adminEmail) {
    redirect("/admin/login?error=not-admin");
  }

  let session;

  try {
    const supabase = getSupabaseAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      redirect("/admin/login?error=invalid-login");
    }

    session = data.session;
  } catch (error) {
    if (typeof error === "object" && error !== null && "digest" in error) throw error;
    redirect("/admin/login?error=supabase");
  }

  await setAdminSession(session.access_token, session.refresh_token);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createArticleAction(formData: FormData) {
  await requireAdmin();

  let input: ArticleInput;
  try {
    input = await parseArticleForm(formData);
  } catch (error) {
    if (error instanceof ImageUploadError) redirect("/admin/articles/new?error=image-upload");
    throw error;
  }

  await createArticle(input);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateArticleAction(id: string, formData: FormData) {
  await requireAdmin();
  const currentArticle = await getAdminArticle(id);
  const currentThumbnailUrl = currentArticle ? getArticleThumbnailUrl(currentArticle) : null;

  let input: ArticleInput;
  try {
    input = await parseArticleForm(formData, currentThumbnailUrl);
  } catch (error) {
    if (error instanceof ImageUploadError) redirect(`/admin/articles/${id}/edit?error=image-upload`);
    throw error;
  }

  await updateArticle(id, input);
  if (input.thumbnail_url && currentThumbnailUrl && input.thumbnail_url !== currentThumbnailUrl) {
    await deleteArticleThumbnail(currentThumbnailUrl);
  }
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteArticleAction(id: string) {
  await requireAdmin();
  const currentArticle = await getAdminArticle(id);
  const currentThumbnailUrl = currentArticle ? getArticleThumbnailUrl(currentArticle) : null;
  await deleteArticle(id);
  await deleteArticleThumbnail(currentThumbnailUrl);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}
