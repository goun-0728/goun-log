import { createClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
  return `https://${trimmed}`;
}

export function getSupabaseAdmin() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !rawKey) {
    throw new Error("Supabase admin environment variables are missing.");
  }

  const url = normalizeSupabaseUrl(rawUrl);
  const key = rawKey.trim();

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getSupabaseRestConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !rawKey) {
    throw new Error("Supabase admin environment variables are missing.");
  }

  return {
    url: normalizeSupabaseUrl(rawUrl),
    key: rawKey.trim(),
  };
}

export function getSupabaseAdminDiagnostics() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let host = "";
  try {
    host = rawUrl ? new URL(normalizeSupabaseUrl(rawUrl)).host : "";
  } catch {
    host = "invalid-url";
  }

  return {
    hasUrl: Boolean(rawUrl?.trim()),
    hasServiceRoleKey: Boolean(rawKey?.trim()),
    host,
  };
}
