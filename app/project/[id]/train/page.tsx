"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { store } from "@/lib/store";
import { checkTrainReady } from "@/lib/ml/guards";
import { trainClassifier, type TrainSample } from "@/lib/ml/train";
import type { ResultCurves } from "@/lib/ml/result-schema";
import { ko } from "@/lib/i18n/ko";
import { Button, Card, ErrorBox, Loading } from "@/components/ui/states";
import { LearningCurves } from "@/components/charts/Charts";

export default function TrainPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [phase, setPhase] = useState<"idle" | "embed" | "fit" | "done">("idle");
  const [progress, setProgress] = useState<{ cur: number; total: number }>({ cur: 0, total: 0 });
  const [live, setLive] = useState<{ acc: number; loss: number; curves: ResultCurves }>({
    acc: 0,
    loss: 0,
    curves: { train_acc: [], val_acc: [], train_loss: [], val_loss: [] },
  });

  async function start() {
    setErrors([]);
    const project = await store.getProject(id);
    if (!project) return;
    const images = await store.listImages(id);
    const labels = await store.listLabels(id);

    // 라벨된 샘플만 + perClass 카운트
    const classIndex = new Map(project.config.classes.map((c, i) => [c, i]));
    const imgById = new Map(images.map((im) => [im.id, im]));
    const samples: TrainSample[] = [];
    const perClassCount: Record<string, number> = {};
    for (const l of labels) {
      if (l.value.kind !== "classification") continue;
      const im = imgById.get(l.imageId);
      const ci = classIndex.get(l.value.class);
      if (!im || ci === undefined) continue;
      samples.push({ blob: im.blob, classIndex: ci });
      perClassCount[l.value.class] = (perClassCount[l.value.class] ?? 0) + 1;
    }

    const guard = checkTrainReady({ labeledCount: samples.length, perClassCount });
    if (!guard.ok) return setErrors(guard.messages);
    setWarnings(guard.messages);

    const run = await store.createRun({
      projectId: id,
      compute: "browser",
      backbone: "mobilenet_v2",
      hyperparams: { epochs: 15, seed: 42 },
    });

    try {
      setPhase("embed");
      const { metrics, modelUri } = await trainClassifier(samples, {
        classes: project.config.classes,
        epochs: 15,
        onProgress: (p) => {
          if (p.stage === "embed") {
            setPhase("embed");
            setProgress({ cur: p.epoch ?? 0, total: p.total ?? 0 });
          } else if (p.stage === "fit") {
            setPhase("fit");
            setProgress({ cur: p.epoch ?? 0, total: p.total ?? 0 });
            const acc = (p.logs?.val_acc as number) ?? (p.logs?.val_accuracy as number) ?? 0;
            const loss = (p.logs?.val_loss as number) ?? 0;
            setLive((prev) => ({
              acc,
              loss,
              curves: {
                train_acc: [...(prev.curves.train_acc ?? []), (p.logs?.acc as number) ?? 0],
                val_acc: [...(prev.curves.val_acc ?? []), acc],
                train_loss: [...(prev.curves.train_loss ?? []), (p.logs?.loss as number) ?? 0],
                val_loss: [...(prev.curves.val_loss ?? []), loss],
              },
            }));
          }
        },
      });
      await store.saveResult(run.id, id, metrics, modelUri);
      await store.updateRun(run.id, { status: "done" });
      setPhase("done");
      router.push(`/project/${id}/result`);
    } catch (e) {
      await store.updateRun(run.id, { status: "failed" });
      setErrors([e instanceof Error ? e.message : "학습 실패"]);
      setPhase("idle");
    }
  }

  const running = phase === "embed" || phase === "fit";

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted">{ko.train.backbone}</div>
            <div className="font-medium">MobileNetV2 (전이학습)</div>
          </div>
          <Button onClick={start} disabled={running}>
            {running ? ko.train.running : ko.train.start}
          </Button>
        </div>

        <ErrorBox messages={errors} />
        {warnings.length > 0 && <p className="text-xs text-warning">⚠ {warnings.join(" / ")}</p>}

        {running && (
          <div className="space-y-2">
            <Loading
              label={
                phase === "embed"
                  ? `특징 추출 ${progress.cur}/${progress.total}`
                  : `${ko.train.epoch} ${progress.cur}/${progress.total} · ${ko.train.accuracy} ${(live.acc * 100).toFixed(1)}%`
              }
            />
            <div className="h-1.5 w-full overflow-hidden rounded bg-elevated">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${progress.total ? (progress.cur / progress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {(running || live.curves.val_acc?.length) && <LearningCurves curves={live.curves} />}
      </Card>
      <p className="text-xs text-muted">
        학습은 전부 브라우저에서 진행돼요(서버 전송 없음). 데이터가 많거나 더 강한 학습이 필요하면 외부 GPU 노트북(곧 제공)을 사용하세요.
      </p>
    </div>
  );
}
