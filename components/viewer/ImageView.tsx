// 다크 캔버스 이미지 뷰어 (관측천문 관례). blob → object URL.
"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ImageView({ blob, alt, className }: { blob: Blob; alt?: string; className?: string }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return (
    <div className={cn("viewer-canvas flex items-center justify-center overflow-hidden rounded", className)}>
      {url && <img src={url} alt={alt ?? ""} className="max-h-full max-w-full object-contain" />}
    </div>
  );
}
