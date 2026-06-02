import { getSupabaseAdmin } from "@/lib/supabase/admin";

const ARTICLE_IMAGE_BUCKET = "article-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export class ImageUploadError extends Error {
  constructor(message = "이미지 업로드에 실패했습니다.") {
    super(message);
    this.name = "ImageUploadError";
  }
}

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

function buildImagePath(file: File) {
  const extension = ALLOWED_IMAGE_TYPES.get(file.type) || "jpg";
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `articles/${Date.now()}-${crypto.randomUUID()}-${safeName || "image"}.${extension}`;
}

export async function uploadArticleImage(value: FormDataEntryValue | null) {
  if (!isFile(value)) return null;

  if (!ALLOWED_IMAGE_TYPES.has(value.type)) {
    throw new ImageUploadError("JPG, PNG, WEBP 파일만 업로드할 수 있습니다.");
  }

  if (value.size > MAX_IMAGE_SIZE) {
    throw new ImageUploadError("이미지는 5MB 이하만 업로드할 수 있습니다.");
  }

  const supabase = getSupabaseAdmin();
  const path = buildImagePath(value);
  const { error } = await supabase.storage.from(ARTICLE_IMAGE_BUCKET).upload(path, value, {
    contentType: value.type,
    upsert: false,
  });

  if (error) throw new ImageUploadError(error.message);

  const { data } = supabase.storage.from(ARTICLE_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export const uploadArticleThumbnail = uploadArticleImage;

export async function deleteArticleThumbnail(publicUrl: string | null | undefined) {
  if (!publicUrl) return;

  try {
    const marker = `/storage/v1/object/public/${ARTICLE_IMAGE_BUCKET}/`;
    const markerIndex = publicUrl.indexOf(marker);
    if (markerIndex === -1) return;

    const path = decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
    if (!path) return;

    const supabase = getSupabaseAdmin();
    await supabase.storage.from(ARTICLE_IMAGE_BUCKET).remove([path]);
  } catch {
    // Deleting an old image must not block article updates or deletes.
  }
}
