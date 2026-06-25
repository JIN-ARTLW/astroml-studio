// 공개 천문 아카이브 연동 (브라우저 직접 호출, CORS 확인 완료).
// SDSS SkyServer / Legacy Survey(DECaLS) / NASA Images API — 모두 access-control-allow-origin: *.
// SkyView·MAST(FITS) 등 CORS 미지원 소스는 추후 얇은 프록시 또는 FITS 디코더(US3) 필요.
"use client";

export type ArchiveSource = "legacy" | "sdss" | "nasa";

export interface ArchiveImageMeta {
  source: ArchiveSource;
  ra?: number;
  dec?: number;
  title?: string;
  survey?: string;
  url: string;
  [key: string]: unknown; // ImageItem.meta(Record<string,unknown>) 호환
}

export interface CutoutOptions {
  size?: number; // px
  pixscale?: number; // arcsec/px (클수록 넓은 시야)
}

/** Legacy Survey (DECaLS/BASS/MzLS) 컷아웃 URL. 넓은 하늘 커버리지. */
export function legacyCutoutUrl(ra: number, dec: number, o: CutoutOptions = {}): string {
  const size = o.size ?? 256;
  const pixscale = o.pixscale ?? 0.5;
  return `https://www.legacysurvey.org/viewer/cutout.jpg?ra=${ra}&dec=${dec}&layer=ls-dr10&pixscale=${pixscale}&size=${size}`;
}

/** SDSS SkyServer 컷아웃 URL. 북반구 천구 광역 커버리지. */
export function sdssCutoutUrl(ra: number, dec: number, o: CutoutOptions = {}): string {
  const size = o.size ?? 256;
  const scale = o.pixscale ?? 0.5;
  return `https://skyserver.sdss.org/dr18/SkyServerWS/ImgCutout/getjpeg?ra=${ra}&dec=${dec}&scale=${scale}&width=${size}&height=${size}`;
}

/** 이미지 URL → Blob. 빈/오류 응답은 null. */
export async function fetchImageBlob(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith("image/") || blob.size < 512) return null; // 빈 컷아웃 방지
    return blob;
  } catch {
    return null;
  }
}

/** 위치(RA/Dec) → 컷아웃 Blob (source별). */
export async function fetchCutout(
  source: Exclude<ArchiveSource, "nasa">,
  ra: number,
  dec: number,
  o: CutoutOptions = {}
): Promise<{ blob: Blob; meta: ArchiveImageMeta } | null> {
  const url = source === "legacy" ? legacyCutoutUrl(ra, dec, o) : sdssCutoutUrl(ra, dec, o);
  const blob = await fetchImageBlob(url);
  if (!blob) return null;
  return { blob, meta: { source, ra, dec, url, survey: source === "legacy" ? "Legacy Survey DR10" : "SDSS DR18" } };
}

/** NASA Images API 텍스트 검색 → 이미지 목록. */
export async function nasaImageSearch(query: string, limit = 12): Promise<ArchiveImageMeta[]> {
  try {
    const res = await fetch(
      `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`,
      { mode: "cors" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const items = (json?.collection?.items ?? []) as Array<{
      data?: Array<{ title?: string }>;
      links?: Array<{ href?: string }>;
    }>;
    const out: ArchiveImageMeta[] = [];
    for (const it of items) {
      const href = it.links?.[0]?.href;
      const title = it.data?.[0]?.title;
      if (href) out.push({ source: "nasa", title, url: href, survey: "NASA Image Library" });
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}
