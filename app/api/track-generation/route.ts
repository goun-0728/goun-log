import { NextResponse } from "next/server";
import { getSupabaseAdminDiagnostics } from "@/lib/supabase/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: Record<string, unknown>) {
  return NextResponse.json(data, { status: 200, headers: corsHeaders });
}

async function incrementGenerationCount() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("increment_generation_count", {
    stat_id: "detail_page_generator",
  });

  if (error) throw error;
  return typeof data === "number" ? data : Number(data) || 0;
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST() {
  try {
    const generationCount = await incrementGenerationCount();
    return json({ ok: true, generationCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown generation tracking error";
    console.error("Generation tracking failed:", message, getSupabaseAdminDiagnostics());
    return json({ ok: false, error: message });
  }
}

export async function GET() {
  try {
    const generationCount = await incrementGenerationCount();
    return json({ ok: true, generationCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown generation tracking error";
    console.error("Generation tracking failed:", message, getSupabaseAdminDiagnostics());
    return json({ ok: false, error: message });
  }
}
