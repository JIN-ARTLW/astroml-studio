// 데모 데이터 (T020).
// 1순위: public/demo/manifest.json(실제 은하 서브셋)이 있으면 그것을 사용.
// 폴백: 합성 예시 3클래스를 클라이언트에서 생성(파이프라인 즉시 검증용).
//   ⚠️ 합성은 학습 파이프라인 검증용 placeholder. 실제 천문 연구엔 실데이터 사용 권장.
//   실데이터 채우는 법: public/demo/README.md 참조 (Galaxy10 DECaLS 3클래스 추출).
"use client";

export const DEMO_CLASSES = ["smooth-round", "edge-on-disk", "spiral"];

export interface DemoImage {
  blob: Blob;
  name: string;
  folderClass: string;
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
      const blob = await r.blob();
      out.push({ blob, name: item.path, folderClass: item.class });
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
}

// 합성 천체 형태 생성 — 3클래스가 시각적으로 뚜렷하도록(분류 학습 가능).
function drawSynthetic(kind: string, seed: number): HTMLCanvasElement {
  const size = 96;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  // 다크 천문 배경 + 노이즈
  ctx.fillStyle = "#05060a";
  ctx.fillRect(0, 0, size, size);
  let s = seed * 2654435761;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `rgba(255,255,255,${rnd() * 0.15})`;
    ctx.fillRect(rnd() * size, rnd() * size, 1, 1);
  }
  const cx = size / 2,
    cy = size / 2;
  ctx.save();
  ctx.translate(cx, cy);
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
    // spiral
    ctx.rotate(rnd() * Math.PI * 2);
    ctx.strokeStyle = "rgba(255,230,200,0.8)";
    ctx.lineWidth = 2.5;
    for (let arm = 0; arm < 2; arm++) {
      ctx.beginPath();
      for (let t = 0; t < Math.PI * 3; t += 0.1) {
        const r = t * 4.2;
        const a = t + arm * Math.PI;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
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
      const canvas = drawSynthetic(cls, (DEMO_CLASSES.indexOf(cls) + 1) * 1000 + i);
      const blob = await canvasToBlob(canvas);
      out.push({ blob, name: `${cls}_${i}.png`, folderClass: cls });
    }
  }
  return out;
}

export interface DemoLoadResult {
  images: DemoImage[];
  synthetic: boolean;
}

export async function loadDemo(): Promise<DemoLoadResult> {
  const real = await tryRealManifest();
  if (real) return { images: real, synthetic: false };
  return { images: await generateSynthetic(), synthetic: true };
}
