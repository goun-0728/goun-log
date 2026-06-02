import { NextResponse } from "next/server";
import { getSupabaseAdminDiagnostics } from "@/lib/supabase/admin";
import { recordVisit } from "@/lib/visits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { path?: unknown };
    const path = typeof body.path === "string" && body.path.trim() ? body.path.trim().slice(0, 500) : "/";
    const result = await recordVisit(path);

    return NextResponse.json({ ...result, diagnostics: getSupabaseAdminDiagnostics() }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown track visit error";
    console.error("Track visit route failed:", message);
    return NextResponse.json({ ok: false, error: message, diagnostics: getSupabaseAdminDiagnostics() }, { status: 200 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get("path") || "/";
    const result = await recordVisit(path.slice(0, 500));

    return NextResponse.json({ ...result, diagnostics: getSupabaseAdminDiagnostics() }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown track visit error";
    console.error("Track visit route failed:", message);
    return NextResponse.json({ ok: false, error: message, diagnostics: getSupabaseAdminDiagnostics() }, { status: 200 });
  }
}
