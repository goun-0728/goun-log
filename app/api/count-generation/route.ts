import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("generation_stats")
      .select("generation_count")
      .eq("id", "detail_page_generator")
      .single();

    const current = data?.generation_count || 0;

    await supabase
      .from("generation_stats")
      .upsert({ id: "detail_page_generator", generation_count: current + 1 });

    return NextResponse.json({ ok: true }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  } catch {
    return NextResponse.json({ ok: false });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
