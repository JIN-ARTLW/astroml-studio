"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { store } from "@/lib/store";
import { ko } from "@/lib/i18n/ko";
import { Button, Card, Empty, Loading } from "@/components/ui/states";
import { LearningCurves, ConfusionMatrix } from "@/components/charts/Charts";
import { ImageView } from "@/components/viewer/ImageView";
import { exportModel, metricsToCsv, downloadCsv } from "@/lib/ml/export";
import { predict } from "@/lib/ml/predict";

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const results = useLiveQuery(() => store.listResults(id), [id]);
  const [mis, setMis] = useState<{ blob: Blob; pred: string; truth: string }[] | null>(null);
  const [misBusy, setMisBusy] = useState(false);

  if (results === undefined) return <Loading />;
  if (results.length === 0)
    return <Empty title="아직 학습 결과가 없어요." action={<Button onClick={() => router.push(`/project/${id}/train`)}>학습하러 가기</Button>} />;

  const latest = results[0];
  const m = latest.result.metrics;
  const acc = m.metrics.accuracy ?? 0;

  async function showMisclassified() {
    if (!latest.result.modelUri) return;
    setMisBusy(true);
    try {
      const images = await store.listImages(id);
      const labels = await store.listLabels(id);
      const truthById = new Map(labels.map((l) => [l.imageId, l.value.kind === "classification" ? l.value.class : ""]));
      const out: { blob: Blob; pred: string; truth: string }[] = [];
      for (const img of images.slice(0, 60)) {
        const truth = truthById.get(img.id);
        if (!truth) continue;
        const [top] = await predict(latest.result.modelUri, m.classes, img.blob, 1);
        if (top && top.class !== truth) out.push({ blob: img.blob, pred: top.class, truth });
      }
      setMis(out);
    } finally {
      setMisBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-muted">{ko.result.valAcc}</div>
          <div className="text-3xl font-semibold tabular-nums">{(acc * 100).toFixed(1)}%</div>
          <div className="text-xs text-muted">
            {latest.result.metrics.trained_with === "browser" ? ko.result.trainedBrowser : ko.result.trainedExternal} ·{" "}
            {m.backbone} · F1(macro) {((m.metrics.f1_macro ?? 0) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="flex gap-2">
          {latest.result.modelUri && (
            <Button variant="outline" onClick={() => exportModel(latest.result.modelUri!)}>{ko.result.exportModel}</Button>
          )}
          <Button variant="outline" onClick={() => downloadCsv(metricsToCsv(m))}>{ko.result.exportCsv}</Button>
          <Button onClick={() => router.push(`/project/${id}/predict`)}>{ko.steps.predict} →</Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-medium text-muted">{ko.result.confusion}</h3>
          <ConfusionMatrix matrix={m.confusion_matrix} classes={m.classes} />
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-medium text-muted">{ko.result.perClass}</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted">
                <th className="text-left">클래스</th><th>정밀도</th><th>재현율</th><th>F1</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(m.per_class ?? {}).map(([c, pc]) => (
                <tr key={c}>
                  <td className="py-1">{c}</td>
                  <td className="text-center tabular-nums">{(pc.precision * 100).toFixed(0)}%</td>
                  <td className="text-center tabular-nums">{(pc.recall * 100).toFixed(0)}%</td>
                  <td className="text-center tabular-nums">{(pc.f1 * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-medium text-muted">{ko.result.curves}</h3>
        <LearningCurves curves={m.curves} />
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted">{ko.result.misclassified}</h3>
          {mis === null && (
            <Button variant="outline" onClick={showMisclassified} disabled={misBusy}>
              {misBusy ? "분석 중…" : "오분류 보기"}
            </Button>
          )}
        </div>
        {mis && mis.length === 0 && <p className="text-sm text-muted">오분류 없음 🎉</p>}
        {mis && mis.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {mis.map((x, i) => (
              <div key={i} className="space-y-1">
                <ImageView blob={x.blob} className="aspect-square w-full" />
                <div className="text-xs">
                  <span className="text-danger">{x.pred}</span> <span className="text-muted">(정답 {x.truth})</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
