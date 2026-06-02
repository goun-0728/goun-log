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
import { deleteArticleThumbnail, uploadArticleThumbnail } from "@/lib/storage";

function clean(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function isRedirectError(error: unknown) {
  return typeof error === "object" && error !== null && "digest" in error;
}

function isDuplicateSlugError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function errorToParam(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "MISSING_TITLE") return "missing-title";
    if (error.message === "MISSING_SLUG") return "missing-slug";
    if (error.message === "MISSING_CONTENT") return "missing-content";
    if (error.message === "PUBLISHED_AT_REQUIRED") return "published-at-required";
  }

  return "save-failed";
}

async function parseArticleForm(formData: FormData, currentThumbnailUrl?: string | null): Promise<ArticleInput> {
  const statusValue = clean(formData.get("status")) || "draft";
  const status: ArticleStatus =
    statusValue === "published" || statusValue === "scheduled" ? statusValue : "draft";
  const publishedAtValue = clean(formData.get("published_at"));
  const title = clean(formData.get("title")) || "";
  const slug = clean(formData.get("slug")) || "";
  const description = clean(formData.get("description"));
  const content = clean(formData.get("content")) || "";
  let uploadedThumbnailUrl: string | null = null;

  try {
    uploadedThumbnailUrl = await uploadArticleThumbnail(formData.get("thumbnail_file"));
  } catch (error) {
    console.error("Article thumbnail upload failed. Saving article without a new image.", error);
  }

  if (!title) throw new Error("MISSING_TITLE");
  if (!slug) throw new Error("MISSING_SLUG");
  if (!content || content === "<p></p>") throw new Error("MISSING_CONTENT");
  if (status === "scheduled" && !publishedAtValue) throw new Error("PUBLISHED_AT_REQUIRED");

  return {
    title,
    slug,
    description,
    content,
    image_url: uploadedThumbnailUrl || currentThumbnailUrl || null,
    status,
    published_at: publishedAtValue ? new Date(publishedAtValue).toISOString() : null,
  };
}

export async function loginAction(formData: FormData) {
  const email = (clean(formData.get("email")) || "").toLowerCase();
  const password = clean(formData.get("password")) || "";
  const adminEmail = getConfiguredAdminEmail();

  if (!adminEmail) redirect("/admin/login?error=missing-admin-email");
  if (email !== adminEmail) redirect("/admin/login?error=not-admin");

  let session;

  try {
    const supabase = getSupabaseAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) redirect("/admin/login?error=invalid-login");
    session = data.session;
  } catch (error) {
    if (isRedirectError(error)) throw error;
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
    redirect(`/admin/articles/new?error=${errorToParam(error)}`);
  }

  try {
    await createArticle(input);
  } catch (error) {
    if (isDuplicateSlugError(error)) redirect("/admin/articles/new?error=duplicate-slug");
    console.error("Article create failed.", error);
    redirect("/admin/articles/new?error=save-failed");
  }

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
    redirect(`/admin/articles/${id}/edit?error=${errorToParam(error)}`);
  }

  try {
    await updateArticle(id, input);
  } catch (error) {
    if (isDuplicateSlugError(error)) redirect(`/admin/articles/${id}/edit?error=duplicate-slug`);
    console.error("Article update failed.", error);
    redirect(`/admin/articles/${id}/edit?error=save-failed`);
  }

  if (input.image_url && currentThumbnailUrl && input.image_url !== currentThumbnailUrl) {
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
