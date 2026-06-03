import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseRestConfig } from "@/lib/supabase/admin";

export type VisitStats = {
  today: number;
  total: number;
  published: number;
  generations: number;
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

function makeHeaders(key: string) {
  return {
    apikey: key,
    authorization: `Bearer ${key}`,
  };
}

function describeError(error: unknown) {
  if (!(error instanceof Error)) return "Unknown error";

  const cause = "cause" in error ? (error as Error & { cause?: unknown }).cause : undefined;
  if (cause instanceof Error) return `${error.message}; cause=${cause.message}`;
  if (cause) return `${error.message}; cause=${JSON.stringify(cause)}`;
  return error.message;
}

function parseCount(contentRange: string | null) {
  if (!contentRange) return 0;
  const total = contentRange.split("/").pop();
  if (!total || total === "*") return 0;
  return Number.parseInt(total, 10) || 0;
}

async function countRows(table: string, filters?: Record<string, string>) {
  const { url, key } = getSupabaseRestConfig();
  const endpoint = new URL(`/rest/v1/${table}`, url);
  endpoint.searchParams.set("select", "id");

  for (const [name, value] of Object.entries(filters || {})) {
    endpoint.searchParams.set(name, value);
  }

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      ...makeHeaders(key),
      Prefer: "count=exact",
      Range: "0-0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`${table} count failed at ${endpoint.toString()}: ${response.status} ${body}`);
  }

  return parseCount(response.headers.get("content-range"));
}

async function getGenerationCount() {
  const { url, key } = getSupabaseRestConfig();
  const endpoint = new URL("/rest/v1/generation_stats", url);
  endpoint.searchParams.set("select", "generation_count");
  endpoint.searchParams.set("id", "eq.detail_page_generator");
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint, {
    method: "GET",
    headers: makeHeaders(key),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`generation_stats select failed at ${endpoint.toString()}: ${response.status} ${body}`);
  }

  const rows = (await response.json().catch(() => [])) as Array<{ generation_count?: number | string | null }>;
  const value = rows[0]?.generation_count;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseInt(value, 10) || 0;
  return 0;
}

export async function recordVisit(path: string): Promise<VisitRecordResult> {
  try {
    const { url, key } = getSupabaseRestConfig();
    const endpoint = new URL("/rest/v1/site_visits", url);
    console.log("Recording site visit through Supabase REST:", endpoint.toString());
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...makeHeaders(key),
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ path }),
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const message = `site_visits insert failed at ${endpoint.toString()}: ${response.status} ${body}`;
      console.error(message);
      return { ok: false, error: message };
    }

    return { ok: true };
  } catch (error) {
    const message = describeError(error);
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
    generations: 0,
  };

  try {
    const todayStart = startOfTodayKstIso();
    const [todayVisits, totalVisits, publishedArticles, generations] = await Promise.allSettled([
      countRows("site_visits", { visited_at: `gte.${todayStart}` }),
      countRows("site_visits"),
      countRows("articles", { status: "eq.published" }),
      getGenerationCount(),
    ]);

    return {
      today: todayVisits.status === "fulfilled" ? todayVisits.value : 0,
      total: totalVisits.status === "fulfilled" ? totalVisits.value : 0,
      published: publishedArticles.status === "fulfilled" ? publishedArticles.value : 0,
      generations: generations.status === "fulfilled" ? generations.value : 0,
    };
  } catch {
    return fallback;
  }
}
