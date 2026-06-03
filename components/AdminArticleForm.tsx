"use client";

import { useEffect, useRef, useState } from "react";
import RichTextEditor from "@/components/RichTextEditor";
import type { Article } from "@/lib/articles";
import { getArticleThumbnailUrl, getStatusLabel, isSafeImageUrl } from "@/lib/article-shared";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type AdminArticleFormProps = {
  action: (formData: FormData) => Promise<void>;
  article?: Article;
  error?: string;
};

const errorMessages: Record<string, string> = {
  "image-upload": "이미지 업로드에 실패했습니다. 이미지를 제외하고 다시 저장해주세요.",
  "save-failed": "글 저장에 실패했습니다. 입력값과 Supabase 연결 상태를 확인해주세요.",
};

export default function AdminArticleForm({ action, article, error }: AdminArticleFormProps) {
  const publishedAt = article?.published_at ? article.published_at.slice(0, 16) : "";
  const currentThumbnailUrl = article ? getArticleThumbnailUrl(article) : null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(currentThumbnailUrl || "");
  const [clientError, setClientError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function validateAndPreview(file: File | null) {
    setClientError("");

    if (!file) {
      setPreviewUrl(currentThumbnailUrl || "");
      return true;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setClientError("JPG, PNG, WEBP 파일만 업로드할 수 있습니다.");
      return false;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setClientError("이미지는 5MB 이하만 업로드할 수 있습니다.");
      return false;
    }

    try {
      const nextPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl((previousUrl) => {
        if (previousUrl.startsWith("blob:")) URL.revokeObjectURL(previousUrl);
        return nextPreviewUrl;
      });
      return true;
    } catch {
      setClientError("이미지 미리보기를 만들 수 없습니다. 다른 이미지를 선택해주세요.");
      setPreviewUrl(currentThumbnailUrl || "");
      return false;
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!validateAndPreview(file)) event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0] || null;
    if (!file || !fileInputRef.current) return;

    try {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
    } catch {
      setClientError("드래그 앤 드롭 처리 중 오류가 발생했습니다. 이미지 선택 버튼을 사용해주세요.");
      return;
    }

    if (!validateAndPreview(file)) fileInputRef.current.value = "";
  }

  const canPreviewImage = previewUrl.startsWith("blob:") || isSafeImageUrl(previewUrl);

  return (
    <form action={action} className="admin-form" encType="multipart/form-data">
      <div className="admin-editor-toolbar">
        <div>
          <strong>{article ? "글 수정" : "새 글 작성"}</strong>
          <span>저장 버튼은 글 작성 중에도 상단에 고정됩니다.</span>
        </div>
        <div className="admin-submit-actions">
          <button type="submit" name="status" value="draft" className="admin-secondary-button">
            임시 저장
          </button>
          <button type="submit" name="status" value="scheduled" className="admin-secondary-button">
            예약 발행
          </button>
          <button type="submit" name="status" value="published" className="admin-primary-button">
            발행하기
          </button>
        </div>
      </div>

      {error || clientError ? <p className="admin-error">{clientError || errorMessages[error || ""] || "오류가 발생했습니다."}</p> : null}

      <label>
        <span>제목 title</span>
        <input name="title" defaultValue={article?.title || ""} required />
      </label>

      <label>
        <span>슬러그 slug</span>
        <input name="slug" defaultValue={article?.slug || ""} placeholder="비워두면 제목으로 저장됩니다." />
      </label>

      <label>
        <span>요약 description</span>
        <textarea name="description" rows={3} defaultValue={article?.description || ""} />
      </label>

      <div>
        <span className="admin-field-label">본문 content</span>
        <RichTextEditor name="content" defaultValue={article?.content || ""} />
      </div>

      <div>
        <span className="admin-field-label">대표 이미지 image_url</span>
        <input type="hidden" name="current_thumbnail_url" value={currentThumbnailUrl || ""} />
        <label className="admin-inline-field">
          <span>이미지 URL</span>
          <input name="image_url" type="url" defaultValue={currentThumbnailUrl || ""} placeholder="https://..." />
        </label>
        <div
          className={`admin-upload-zone${isDragging ? " is-dragging" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {previewUrl && canPreviewImage ? (
            <img src={previewUrl} alt="대표 이미지 미리보기" />
          ) : (
            <div className="admin-upload-placeholder">
              <strong>이미지를 선택하거나 URL을 입력해주세요.</strong>
              <span>선택사항입니다. JPG, PNG, WEBP / 최대 5MB</span>
            </div>
          )}

          <label className="admin-upload-button">
            이미지 선택
            <input
              ref={fileInputRef}
              name="thumbnail_file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />
          </label>
        </div>
        <p className="muted-copy">업로드가 실패해도 글은 URL 이미지나 이미지 없이 저장됩니다.</p>
      </div>

      <div className="admin-form-grid">
        <div className="admin-status-panel">
          <span className="admin-field-label">현재 상태</span>
          <strong>{getStatusLabel(article?.status || "draft")}</strong>
        </div>
        <label>
          <span>예약/발행일 published_at</span>
          <input name="published_at" type="datetime-local" defaultValue={publishedAt} />
        </label>
      </div>
    </form>
  );
}
