"use client";

import { useState } from "react";
import { isSafeImageUrl } from "@/lib/article-shared";

type SafeImageProps = {
  src: string | null | undefined;
  alt?: string;
  className?: string;
};

export default function SafeImage({ src, alt = "", className }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const safeSrc = isSafeImageUrl(src) ? src?.trim() : "";

  if (!safeSrc || failed) return null;

  return <img src={safeSrc} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
}
