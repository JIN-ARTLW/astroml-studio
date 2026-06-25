"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { store } from "@/lib/store";
import { ko } from "@/lib/i18n/ko";
import { Button, Card, Loading } from "@/components/ui/states";
import { ImageView } from "@/components/viewer/ImageView";
import { cn } from "@/lib/utils";

export default function LabelPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const project = useLiveQuery(() => store.getProject(id), [id]);
  const images = useLiveQuery(() => store.listImages(id), [id]);
  const labels = useLiveQuery(() => store.listLabels(id), [id]);
  const [cursor, setCursor] = useState(0);

  const labelByImage = useMemo(() => {
    const m = new Map<string, string>();
    labels?.forEach((l) => {
      if (l.value.kind === "classification") m.set(l.imageId, l.value.class);
    });
    return m;
  }, [labels]);

  const classes = project?.config.classes ?? [];
  const current = images?.[cursor];

  const assign = useCallback(
    async (cls: string) => {
      if (!current) return;
      await store.setLabel(current.id, { kind: "classification", class: cls }, "manual");
      setCursor((c) => Math.min(c + 1, (images?.length ?? 1) - 1));
    },
    [current, images]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const n = parseInt(e.key, 10);
      if (!isNaN(n) && n >= 1 && n <= classes.length) assign(classes[n - 1]);
      if (e.key === "ArrowRight") setCursor((c) => Math.min(c + 1, (images?.length ?? 1) - 1));
      if (e.key === "ArrowLeft") setCursor((c) => Math.max(c - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [classes, assign, images]);

  if (!project || !images) return <Loading />;

  const labeled = labelByImage.size;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{ko.label.progress(labeled, images.length)}</span>
        <span className="text-xs text-muted">{ko.label.autoLabeled}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded bg-elevated">
        <div className="h-full bg-accent transition-all" style={{ width: `${(labeled / Math.max(1, images.length)) * 100}%` }} />
      </div>

      {current ? (
        <Card className="space-y-4">
          <ImageView blob={current.blob} className="mx-auto aspect-square w-full max-w-sm" />
          <p className="text-center text-sm text-muted">
            {ko.label.pickClass} ({cursor + 1}/{images.length})
            {labelByImage.get(current.id) && <span className="ml-2 text-accent">→ {labelByImage.get(current.id)}</span>}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {classes.map((c, i) => (
              <Button
                key={c}
                variant={labelByImage.get(current.id) === c ? "primary" : "outline"}
                onClick={() => assign(c)}
              >
                <span className="opacity-60">{i + 1}</span> {c}
              </Button>
            ))}
          </div>
        </Card>
      ) : (
        <p className="text-muted">이미지가 없습니다.</p>
      )}

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setCursor((c) => Math.max(0, c - 1))}>← 이전</Button>
        <Button
          onClick={() => router.push(`/project/${id}/train`)}
          disabled={labeled === 0}
          className={cn(labeled === 0 && "opacity-50")}
        >
          다음: {ko.steps.train} →
        </Button>
      </div>
    </div>
  );
}
