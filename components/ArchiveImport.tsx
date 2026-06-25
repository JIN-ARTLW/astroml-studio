// 아카이브 불러오기 패널 — 좌표/천체명 → SDSS·Legacy 컷아웃, NASA 이미지 검색 임포트.
"use client";
import { useState } from "react";
import { store } from "@/lib/store";
import {
  fetchCutout,
  fetchImageBlob,
  nasaImageSearch,
  type ArchiveSource,
  type ArchiveImageMeta,
} from "@/lib/astro/archives";
import { FAMOUS_OBJECTS } from "@/lib/demo/curatedGalaxies";
import { Button, Card, Loading } from "@/components/ui/states";
import { cn } from "@/lib/utils";

export function ArchiveImport({ projectId, onImported }: { projectId: string; onImported?: () => void }) {
  const [src, setSrc] = useState<ArchiveSource>("legacy");
  const [ra, setRa] = useState("202.4696");
  const [dec, setDec] = useState("47.1952");
  const [pixscale, setPixscale] = useState("0.5");
  const [query, setQuery] = useState("galaxy");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [nasaResults, setNasaResults] = useState<ArchiveImageMeta[]>([]);

  async function importPositional() {
    setBusy(true);
    setNote("");
    try {
      const got = await fetchCutout(src as "legacy" | "sdss", parseFloat(ra), parseFloat(dec), {
        size: 256,
        pixscale: parseFloat(pixscale),
      });
      if (!got) {
        setNote("해당 위치에서 이미지를 찾지 못했어요(서베이 미커버 가능). 좌표/소스를 바꿔보세요.");
        return;
      }
      await store.addImages(
        projectId,
        [{ blob: got.blob, name: `${src}_${ra}_${dec}.jpg`, meta: got.meta }],
        "archive"
      );
      setNote(`${got.meta.survey} 컷아웃 1장 추가됨 (RA ${ra}, Dec ${dec}).`);
      onImported?.();
    } finally {
      setBusy(false);
    }
  }

  async function searchNasa() {
    setBusy(true);
    setNote("");
    setNasaResults(await nasaImageSearch(query, 12));
    setBusy(false);
  }

  async function addNasa(item: ArchiveImageMeta) {
    setBusy(true);
    const blob = await fetchImageBlob(item.url);
    if (blob) {
      await store.addImages(projectId, [{ blob, name: (item.title ?? "nasa") + ".jpg", meta: item }], "archive");
      setNote(`"${item.title}" 추가됨.`);
      onImported?.();
    } else {
      setNote("이미지를 가져오지 못했어요.");
    }
    setBusy(false);
  }

  const sources: { key: ArchiveSource; label: string }[] = [
    { key: "legacy", label: "Legacy Survey" },
    { key: "sdss", label: "SDSS" },
    { key: "nasa", label: "NASA 이미지" },
  ];

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">공개 천문 아카이브에서 불러오기</h3>
        <div className="flex gap-1">
          {sources.map((s) => (
            <button
              key={s.key}
              onClick={() => setSrc(s.key)}
              className={cn(
                "rounded px-2.5 py-1 text-xs transition",
                src === s.key ? "bg-accent text-accent-fg" : "text-muted hover:bg-elevated"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {src !== "nasa" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-muted">
              RA
              <input value={ra} onChange={(e) => setRa(e.target.value)} className="mt-1 block w-28 rounded border border-border bg-bg px-2 py-1.5 text-sm" />
            </label>
            <label className="text-xs text-muted">
              Dec
              <input value={dec} onChange={(e) => setDec(e.target.value)} className="mt-1 block w-28 rounded border border-border bg-bg px-2 py-1.5 text-sm" />
            </label>
            <label className="text-xs text-muted">
              arcsec/px
              <input value={pixscale} onChange={(e) => setPixscale(e.target.value)} className="mt-1 block w-20 rounded border border-border bg-bg px-2 py-1.5 text-sm" />
            </label>
            <Button onClick={importPositional} disabled={busy}>불러오기</Button>
          </div>
          <label className="block text-xs text-muted">
            유명 천체로 좌표 채우기
            <select
              className="mt-1 block w-full rounded border border-border bg-bg px-2 py-1.5 text-sm"
              onChange={(e) => {
                const o = FAMOUS_OBJECTS.find((f) => f.name === e.target.value);
                if (o) {
                  setRa(String(o.ra));
                  setDec(String(o.dec));
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>선택…</option>
              {FAMOUS_OBJECTS.map((o) => (
                <option key={o.name} value={o.name}>{o.name}</option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchNasa()}
              placeholder="예: Andromeda, nebula, M51"
              className="flex-1 rounded border border-border bg-bg px-3 py-2 text-sm"
            />
            <Button onClick={searchNasa} disabled={busy}>검색</Button>
          </div>
          {nasaResults.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {nasaResults.map((r) => (
                <button key={r.url} onClick={() => addNasa(r)} className="viewer-canvas aspect-square overflow-hidden rounded ring-accent hover:ring-2" title={r.title}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.url} alt={r.title ?? ""} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {busy && <Loading />}
      {note && <p className="text-xs text-muted">{note}</p>}
      <p className="text-[11px] text-muted">
        출처: SDSS DR18 · Legacy Survey DR10 · NASA Image Library. 좌표(RA/Dec)·survey는 각 이미지에 출처로 기록됩니다.
      </p>
    </Card>
  );
}
