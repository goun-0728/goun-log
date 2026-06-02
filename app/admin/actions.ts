"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, requireAdmin, setAdminSession } from "@/lib/auth";
import { createArticle, deleteArticle, getAdminArticle, updateArticle, type ArticleInput, type ArticleStatus } from "@/lib/articles";
import { getSupabaseAuthClient } from "@/lib/supabase/client";
import { ImageUploadError, uploadArticleThumbnail } from "@/lib/storage";

function clean(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function isRedirectError(error: unknown) {
  return typeof error === "object" && error !== null && "digest" in error;
}

function parseStatus(value: string | null): ArticleStatus {
  if (value === "published" || value === "scheduled") return value;
  return "draft";
}

function makeArticleInput(formData: FormData, imageUrl: string | null): ArticleInput {
  const title = clean(formData.get("title")) || "";
  const status = parseStatus(clean(formData.get("status")));
  const publishedAtValue = clean(formData.get("published_at"));

  return {
    title,
    slug: clean(formData.get("slug")) || title,
    description: clean(formData.get("description")),
    content: clean(formData.get("content")) || "",
    image_url: imageUrl,
    status,
    published_at: publishedAtValue ? new Date(publishedAtValue).toISOString() : null,
  };
}

async function resolveImageUrl(formData: FormData, currentImageUrl: string | null) {
  const manualUrl = clean(formData.get("image_url"));
  const fallbackUrl = manualUrl || currentImageUrl;

  try {
    const uploadedUrl = await uploadArticleThumbnail(formData.get("thumbnail_file") || formData.get("image_file"));
    return {
      imageUrl: uploadedUrl || fallbackUrl,
      uploadError: null as string | null,
    };
  } catch (error) {
    if (error instanceof ImageUploadError) {
      return {
        imageUrl: fallbackUrl,
        uploadError: error.message || "이미지 업로드에 실패했습니다. 글은 이미지 없이 저장됩니다.",
      };
    }

    return {
      imageUrl: fallbackUrl,
      uploadError: "이미지 업로드에 실패했습니다. 글은 이미지 없이 저장됩니다.",
    };
  }
}

function redirectToAdmin(uploadError?: string | null) {
  revalidatePath("/");
  revalidatePath("/admin");
  redirect(uploadError ? `/admin?notice=${encodeURIComponent(uploadError)}` : "/admin");
}

export async function loginAction(formData: FormData) {
  const email = clean(formData.get("email")) || "";
  const password = clean(formData.get("password")) || "";
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail || email !== adminEmail) {
    redirect("/admin/login?error=unauthorized");
  }

  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    redirect("/admin/login?error=login");
  }

  await setAdminSession(data.session.access_token, data.session.refresh_token);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createArticleAction(formData: FormData) {
  await requireAdmin();

  try {
    const { imageUrl, uploadError } = await resolveImageUrl(formData, null);
    await createArticle(makeArticleInput(formData, imageUrl));
    redirectToAdmin(uploadError);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirect("/admin/articles/new?error=save-failed");
  }
}

export async function updateArticleAction(id: string, formData: FormData) {
  await requireAdmin();

  try {
    const currentArticle = await getAdminArticle(id);
    const currentImageUrl = currentArticle?.image_url || currentArticle?.thumbnail_url || null;
    const { imageUrl, uploadError } = await resolveImageUrl(formData, currentImageUrl);
    await updateArticle(id, makeArticleInput(formData, imageUrl));
    redirectToAdmin(uploadError);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirect(`/admin/articles/${id}/edit?error=save-failed`);
  }
}

export async function deleteArticleAction(id: string) {
  await requireAdmin();
  await deleteArticle(id);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}
