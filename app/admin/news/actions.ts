"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { collectShoppingNews, createDraftFromCollectedNews, ignoreCollectedNews } from "@/lib/news";
import { requireAdmin } from "@/lib/auth";

function resultParam(params: Record<string, string | number>) {
  return new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
  ).toString();
}

export async function collectNewsAction() {
  await requireAdmin();

  try {
    const result = await collectShoppingNews();
    revalidatePath("/admin/news");
    redirect(`/admin/news?${resultParam({ result: "collected", ...result })}`);
  } catch (error) {
    console.error("Collect news failed.", error);
    redirect("/admin/news?error=collect-failed");
  }
}

export async function createNewsDraftAction(id: string) {
  await requireAdmin();

  try {
    await createDraftFromCollectedNews(id);
    revalidatePath("/admin/news");
    revalidatePath("/admin");
    redirect("/admin/news?result=drafted");
  } catch (error) {
    console.error("Create news draft failed.", error);
    redirect("/admin/news?error=draft-failed");
  }
}

export async function ignoreNewsAction(id: string) {
  await requireAdmin();

  try {
    await ignoreCollectedNews(id);
    revalidatePath("/admin/news");
    redirect("/admin/news?result=ignored");
  } catch (error) {
    console.error("Ignore news failed.", error);
    redirect("/admin/news?error=ignore-failed");
  }
}
