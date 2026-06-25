"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { store } from "@/lib/store";
import { loadDemo } from "@/lib/demo/loadDemo";
import { ko } from "@/lib/i18n/ko";
import { Button, Card, Banner, Loading } from "@/components/ui/states";

const SCALE_LIMIT = 1500; // FR-029 / SC-009

export default function DataPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const images = useLiveQuery(() => store.listImages(id), [id]);

  // 홈의 "예시 바로 해보기" → ?demo=1 자동 로드
  useEffect(() => {
    if (search.get("demo") === "1") {
      void handleDemo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDemo() {
    setBusy(true);
    setNote("");
    try {
      const { images: demo, synthetic } = await loadDemo();
      const res = await store.addImages(
        id,
        demo.map((d) => ({ blob: d.blob, name: d.name, folderClass: d.folderClass })),
        "demo"
      );
      setNote(
        (synthetic ? "⚠️ 합성 예시 데이터입니다(실제 연구엔 실데이터 권장). " : "") +
          `${res.added}장 추가됨.`
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleFiles(files: FileList | null, withFolder: boolean) {
    if (!files) return;
    setBusy(true);
    const arr = Array.from(files).map((f) => ({
      blob: f,
      name: f.name,
      folderClass: withFolder ? f.webkitRelativePath?.split("/").slice(-2, -1)[0] : undefined,
    }));
    const res = await store.addImages(id, arr, withFolder ? "folder" : "upload");
    setNote(
      `${res.added}장 추가됨.` +
        (res.skipped.length ? ` ${ko.data.skipped} ${res.skipped.length}장.` : "")
    );
    setBusy(false);
  }

  const count = images?.length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleDemo} disabled={busy}>{ko.data.loadDemo}</Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
          {ko.data.upload}
        </Button>
        <Button variant="outline" onClick={() => folderRef.current?.click()} disabled={busy}>
          {ko.data.uploadFolder}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files, false)}
        />
        <input
          ref={folderRef}
          type="file"
          hidden
          multiple
          // @ts-expect-error 폴더 업로드 비표준 속성
          webkitdirectory=""
          onChange={(e) => handleFiles(e.target.files, true)}
        />
      </div>

      {busy && <Loading />}
      {note && <p className="text-sm text-muted">{note}</p>}
      {count > SCALE_LIMIT && <Banner>{ko.data.scaleWarn}</Banner>}

      <Card>
        <div className="mb-3 text-sm text-muted">{ko.data.count(count)}</div>
        {images && images.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {images.slice(0, 32).map((img) => (
              <Thumb key={img.id} blob={img.thumb ?? img.blob} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">데모를 불러오거나 이미지를 업로드하세요.</p>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => router.push(`/project/${id}/label`)} disabled={count === 0}>
          다음: {ko.steps.label} →
        </Button>
      </div>
    </div>
  );
}

function Thumb({ blob }: { blob: Blob }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return <div className="viewer-canvas aspect-square overflow-hidden rounded">{url && <img src={url} alt="" className="h-full w-full object-cover" />}</div>;
}
