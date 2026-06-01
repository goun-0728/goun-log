import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/visits";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { path?: unknown };
    const path = typeof body.path === "string" && body.path.trim() ? body.path.trim().slice(0, 500) : "/";

    await recordVisit(path);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
