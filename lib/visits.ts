import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type VisitStats = {
  today: number;
  total: number;
  published: number;
};

export type VisitRecordResult = {
  ok: boolean;
  error?: string;
};

function startOfTodayKstIso() {
  const now = new Date();
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffsetMs);
  const startUtcMs = Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()) - kstOffsetMs;

  return new Date(startUtcMs).toISOString();
}

export async function recordVisit(path: string): Promise<VisitRecordResult> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("site_visits").insert({ path });

    if (error) {
      console.error("Failed to insert site visit:", error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown visit tracking error";
    console.error("Failed to record site visit:", message);
    return { ok: false, error: message };
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

    if (todayVisits.status === "fulfilled" && todayVisits.value.error) {
      console.error("Failed to fetch today visits:", todayVisits.value.error.message);
    }
    if (totalVisits.status === "fulfilled" && totalVisits.value.error) {
      console.error("Failed to fetch total visits:", totalVisits.value.error.message);
    }
    if (publishedArticles.status === "fulfilled" && publishedArticles.value.error) {
      console.error("Failed to fetch published article count:", publishedArticles.value.error.message);
    }

    return {
      today: todayVisits.status === "fulfilled" && !todayVisits.value.error ? todayVisits.value.count || 0 : 0,
      total: totalVisits.status === "fulfilled" && !totalVisits.value.error ? totalVisits.value.count || 0 : 0,
      published:
        publishedArticles.status === "fulfilled" && !publishedArticles.value.error
          ? publishedArticles.value.count || 0
          : 0,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown stats error";
    console.error("Failed to fetch visit stats:", message);
    return fallback;
  }
}
