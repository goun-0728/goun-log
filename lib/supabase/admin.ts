import { createClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
  return `https://${trimmed}`;
}

function decodeJwtPayload(token?: string) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
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
  const keyPayload = decodeJwtPayload(rawKey?.trim());

  let host = "";
  let projectRefFromUrl = "";
  try {
    const parsed = rawUrl ? new URL(normalizeSupabaseUrl(rawUrl)) : null;
    host = parsed?.host || "";
    projectRefFromUrl = host.split(".")[0] || "";
  } catch {
    host = "invalid-url";
  }

  return {
    hasUrl: Boolean(rawUrl?.trim()),
    hasServiceRoleKey: Boolean(rawKey?.trim()),
    host,
    projectRefFromUrl,
    serviceRoleKeyRole: typeof keyPayload?.role === "string" ? keyPayload.role : null,
    serviceRoleKeyRef: typeof keyPayload?.ref === "string" ? keyPayload.ref : null,
    serviceRoleKeyIssuer: typeof keyPayload?.iss === "string" ? keyPayload.iss : null,
  };
}
