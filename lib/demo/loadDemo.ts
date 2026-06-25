// 데모 데이터 (T020) — 실데이터 우선.
// 우선순위:
//   1) public/demo/manifest.json (오프라인 번들 실데이터)가 있으면 사용
//   2) 공개 아카이브 라이브 컷아웃(SDSS/Legacy) — 큐레이션 은하 좌표로 진짜 관측데이터 로드 (기본)
//   3) 합성 예시 — 오프라인/실패 시 폴백(파이프라인 검증용 placeholder)
"use client";
import { fetchCutout } from "@/lib/astro/archives";
import { CURATED_GALAXIES } from "./curatedGalaxies";

export const DEMO_CLASSES = ["smooth-round", "edge-on-disk", "spiral"];

export interface DemoImage {
  blob: Blob;
  name: string;
  folderClass: string;
  meta?: Record<string, unknown>;
}

export type DemoSourceKind = "bundled" | "archive" | "synthetic";
export interface DemoLoadResult {
  images: DemoImage[];
  source: DemoSourceKind;
}

interface Manifest {
  classes: string[];
  items: { path: string; class: string }[];
  source?: string;
}

async function tryRealManifest(): Promise<DemoImage[] | null> {
  try {
    const res = await fetch("/demo/manifest.json");
    if (!res.ok) return null;
    const manifest = (await res.json()) as Manifest;
    const out: DemoImage[] = [];
    for (const item of manifest.items) {
      const r = await fetch("/demo/" + item.path);
      if (!r.ok) continue;
      out.push({ blob: await r.blob(), name: item.path, folderClass: item.class });
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

// 큐레이션 은하 → 라이브 컷아웃 (Legacy 우선, 실패 시 SDSS).
async function fetchCuratedArchive(onProgress?: (cur: number, total: number) => void): Promise<DemoImage[]> {
  const out: DemoImage[] = [];
  const total = CURATED_GALAXIES.length;
  for (let i = 0; i < total; i++) {
    const g = CURATED_GALAXIES[i];
    const opts = { size: 224, pixscale: g.scale };
    let got = await fetchCutout("legacy", g.ra, g.dec, opts);
    if (!got) got = await fetchCutout("sdss", g.ra, g.dec, opts);
    if (got) {
      out.push({
        blob: got.blob,
        name: `${g.name}.jpg`,
        folderClass: g.cls,
        meta: { ...got.meta, name: g.name },
      });
    }
    onProgress?.(i + 1, total);
  }
  return out;
}

// --- 합성 폴백 (오프라인) ---
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
}

function drawSynthetic(kind: string, seed: number): HTMLCanvasElement {
  const size = 96;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#05060a";
  ctx.fillRect(0, 0, size, size);
  let s = seed * 2654435761;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `rgba(255,255,255,${rnd() * 0.15})`;
    ctx.fillRect(rnd() * size, rnd() * size, 1, 1);
  }
  ctx.save();
  ctx.translate(size / 2, size / 2);
  const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, 30);
  grad.addColorStop(0, "rgba(255,245,220,0.95)");
  grad.addColorStop(1, "rgba(255,200,140,0)");
  if (kind === "smooth-round") {
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 22 + rnd() * 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "edge-on-disk") {
    ctx.rotate((rnd() - 0.5) * Math.PI);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 6 + rnd() * 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.rotate(rnd() * Math.PI * 2);
    ctx.strokeStyle = "rgba(255,230,200,0.8)";
    ctx.lineWidth = 2.5;
    for (let arm = 0; arm < 2; arm++) {
      ctx.beginPath();
      for (let t = 0; t < Math.PI * 3; t += 0.1) {
        const r = t * 4.2;
        const a = t + arm * Math.PI;
        t === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.stroke();
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  return c;
}

async function generateSynthetic(perClass = 40): Promise<DemoImage[]> {
  const out: DemoImage[] = [];
  for (const cls of DEMO_CLASSES) {
    for (let i = 0; i < perClass; i++) {
      const blob = await canvasToBlob(drawSynthetic(cls, (DEMO_CLASSES.indexOf(cls) + 1) * 1000 + i));
      out.push({ blob, name: `${cls}_${i}.png`, folderClass: cls });
    }
  }
  return out;
}

export async function loadDemo(onProgress?: (cur: number, total: number) => void): Promise<DemoLoadResult> {
  const bundled = await tryRealManifest();
  if (bundled) return { images: bundled, source: "bundled" };

  const archive = await fetchCuratedArchive(onProgress);
  // 클래스별 최소 표본이 모이면 실데이터 사용
  const perClass: Record<string, number> = {};
  archive.forEach((a) => (perClass[a.folderClass] = (perClass[a.folderClass] ?? 0) + 1));
  const enough = DEMO_CLASSES.every((c) => (perClass[c] ?? 0) >= 3);
  if (archive.length >= 9 && enough) return { images: archive, source: "archive" };

  return { images: await generateSynthetic(), source: "synthetic" };
}
