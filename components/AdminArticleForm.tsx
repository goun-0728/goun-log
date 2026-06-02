"use client";

import { useEffect, useRef, useState } from "react";
import type { Article } from "@/lib/articles";
import { getArticleThumbnailUrl, getStatusLabel } from "@/lib/articles";
import RichTextEditor from "@/components/RichTextEditor";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AdminArticleForm({
  action,
  article,
  uploadError,
}: {
  action: (formData: FormData) => Promise<void>;
  article?: Article;
  submitLabel: string;
  uploadError?: string;
}) {
  const publishedAt = article?.published_at ? article.published_at.slice(0, 16) : "";
  const currentThumbnailUrl = article ? getArticleThumbnailUrl(article) : null;
  const errorMessage =
    uploadError === "published-at-required"
      ? "예약발행은 발행일/시간 입력이 필요합니다."
      : "대표 이미지 업로드에 실패했습니다. 파일 형식과 크기를 확인해주세요.";
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
      setClientError("JPG, JPEG, PNG, WEBP 파일만 업로드할 수 있습니다.");
      return false;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setClientError("대표 이미지는 5MB 이하만 업로드할 수 있습니다.");
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

  return (
    <form action={action} className="admin-form" encType="multipart/form-data">
      {uploadError || clientError ? <p className="admin-error">{clientError || errorMessage}</p> : null}

      <label>
        <span>제목</span>
        <input name="title" defaultValue={article?.title || ""} required />
      </label>
      <label>
        <span>슬러그</span>
        <input name="slug" defaultValue={article?.slug || ""} required />
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
        <span className="admin-field-label">대표 이미지 업로드</span>
        <input type="hidden" name="current_thumbnail_url" value={currentThumbnailUrl || ""} />
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
          {previewUrl ? (
            <img src={previewUrl} alt="대표 이미지 미리보기" />
          ) : (
            <div className="admin-upload-placeholder">
              <strong>이미지를 선택하거나 여기에 놓아주세요.</strong>
              <span>JPG, JPEG, PNG, WEBP / 최대 5MB</span>
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
      </div>

      <div className="admin-form-grid">
        <div className="admin-status-panel">
          <span className="admin-field-label">현재 상태</span>
          <strong>{getStatusLabel(article?.status || "draft")}</strong>
        </div>
        <label>
          <span>발행일</span>
          <input name="published_at" type="datetime-local" defaultValue={publishedAt} />
        </label>
      </div>
      <div className="admin-submit-actions">
        <button type="submit" name="status" value="draft" className="admin-secondary-button">
          임시저장
        </button>
        <button type="submit" name="status" value="scheduled" className="admin-secondary-button">
          예약발행
        </button>
        <button type="submit" name="status" value="published" className="admin-primary-button">
          발행하기
        </button>
      </div>
    </form>
  );
}
