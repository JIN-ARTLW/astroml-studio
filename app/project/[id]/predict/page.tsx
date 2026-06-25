"use client";
import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { store } from "@/lib/store";
import { predict, type Prediction } from "@/lib/ml/predict";
import { ko } from "@/lib/i18n/ko";
import { Button, Card, Empty, Loading } from "@/components/ui/states";
import { ImageView } from "@/components/viewer/ImageView";

export default function PredictPage() {
  const { id } = useParams<{ id: string }>();
  const results = useLiveQuery(() => store.listResults(id), [id]);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preds, setPreds] = useState<Prediction[] | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (results === undefined) return <Loading />;
  const latest = results[0];
  if (!latest?.result.modelUri) return <Empty title="먼저 학습을 완료하세요." />;

  async function onFile(f: File | null) {
    if (!f) return;
    setBlob(f);
    setBusy(true);
    setPreds(null);
    try {
      const p = await predict(latest.result.modelUri!, latest.result.metrics.classes, f, 3);
      setPreds(p);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <Button onClick={() => fileRef.current?.click()}>{ko.predict.drop}</Button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />

        {blob && (
          <div className="grid gap-5 sm:grid-cols-2">
            <ImageView blob={blob} className="aspect-square w-full" />
            <div className="space-y-2">
              {busy && <Loading label="예측 중…" />}
              {preds?.map((p, i) => (
                <div key={p.class} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={i === 0 ? "font-semibold text-accent" : ""}>{p.class}</span>
                    <span className="tabular-nums text-muted">{(p.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded bg-elevated">
                    <div className="h-full bg-accent" style={{ width: `${p.confidence * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
