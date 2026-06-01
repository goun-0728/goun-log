import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type VisitStats = {
  today: number;
  total: number;
  published: number;
};

function startOfTodayKstIso() {
  const now = new Date();
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffsetMs);
  const startUtcMs = Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()) - kstOffsetMs;

  return new Date(startUtcMs).toISOString();
}

export async function recordVisit(path: string) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("site_visits").insert({ path });
  } catch {
    // Public pages should still render if analytics is unavailable.
  }
}

export async function getVisitStats(): Promise<VisitStats> {
  noStore();
  const fallback: VisitStats = {
    today: 0,
    total: 0,
    published: 0,
  };

  try {
    const supabase = getSupabaseAdmin();
    const todayStart = startOfTodayKstIso();

    const [todayVisits, totalVisits, publishedArticles] = await Promise.allSettled([
      supabase.from("site_visits").select("id", { count: "exact", head: true }).gte("visited_at", todayStart),
      supabase.from("site_visits").select("id", { count: "exact", head: true }),
      supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
    ]);

    return {
      today: todayVisits.status === "fulfilled" ? todayVisits.value.count || 0 : 0,
      total: totalVisits.status === "fulfilled" ? totalVisits.value.count || 0 : 0,
      published: publishedArticles.status === "fulfilled" ? publishedArticles.value.count || 0 : 0,
    };
  } catch {
    return fallback;
  }
}
