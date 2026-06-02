import { NextResponse } from "next/server";
import { getCurrentAdminEmail } from "@/lib/auth";
import { ImageUploadError, uploadArticleImage } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const adminEmail = await getCurrentAdminEmail();
    if (!adminEmail) {
      return NextResponse.json({ ok: false, error: "관리자 로그인이 필요합니다." }, { status: 401 });
    }

    const formData = await request.formData();
    const url = await uploadArticleImage(formData.get("image"));

    if (!url) {
      return NextResponse.json({ ok: false, error: "이미지 파일이 없습니다." }, { status: 400 });
    }

    return NextResponse.json({ ok: true, url });
  } catch (error) {
    if (error instanceof ImageUploadError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: "이미지 업로드에 실패했습니다." }, { status: 500 });
  }
}
