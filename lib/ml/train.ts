// 브라우저 전이학습 파이프라인 (FR-012/013/014/020).
// MobileNetV2 임베딩(고정) + Dense(softmax) 헤드 학습 → ResultMetrics(result-schema).
"use client";
import * as tf from "@tensorflow/tfjs";
import { loadBackbone, embed } from "./backbone";
import type { ResultMetrics, PerClassMetric } from "./result-schema";

export interface TrainSample {
  blob: Blob;
  classIndex: number;
}

export interface TrainOptions {
  classes: string[];
  epochs?: number;
  seed?: number;
  valSplit?: number;
  onProgress?: (p: { stage: "embed" | "fit"; epoch?: number; total?: number; logs?: tf.Logs }) => void;
}

export interface TrainOutput {
  metrics: ResultMetrics;
  modelUri: string;
}

// 결정적 셔플 (seed) — 재현성(P5 연결).
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function trainClassifier(samples: TrainSample[], opts: TrainOptions): Promise<TrainOutput> {
  const { classes, epochs = 15, seed = 42, valSplit = 0.2, onProgress } = opts;
  const numClasses = classes.length;

  // 1) 임베딩 추출 (캐시: 1회)
  const model = await loadBackbone();
  const shuffled = seededShuffle(samples, seed);
  const embeddings: tf.Tensor[] = [];
  const labels: number[] = [];
  for (let i = 0; i < shuffled.length; i++) {
    const e = await embed(model, shuffled[i].blob);
    embeddings.push(e);
    labels.push(shuffled[i].classIndex);
    onProgress?.({ stage: "embed", epoch: i + 1, total: shuffled.length });
    await tf.nextFrame();
  }

  const X = tf.concat(embeddings, 0); // [N, D]
  embeddings.forEach((t) => t.dispose());
  const y = tf.oneHot(tf.tensor1d(labels, "int32"), numClasses); // [N, C]
  const embDim = X.shape[1]!;

  // 2) train/val 분할
  const n = X.shape[0]!;
  const nVal = Math.max(1, Math.floor(n * valSplit));
  const nTrain = n - nVal;
  const xTrain = X.slice([0, 0], [nTrain, embDim]);
  const yTrain = y.slice([0, 0], [nTrain, numClasses]);
  const xVal = X.slice([nTrain, 0], [nVal, embDim]);
  const yVal = y.slice([nTrain, 0], [nVal, numClasses]);
  const valLabels = labels.slice(nTrain);

  // 3) 헤드 모델
  const head = tf.sequential();
  head.add(tf.layers.dense({ inputShape: [embDim], units: 64, activation: "relu" }));
  head.add(tf.layers.dropout({ rate: 0.2 }));
  head.add(tf.layers.dense({ units: numClasses, activation: "softmax" }));
  head.compile({ optimizer: tf.train.adam(0.001), loss: "categoricalCrossentropy", metrics: ["accuracy"] });

  // 4) 학습 (에폭별 곡선)
  const curves = { train_loss: [] as number[], val_loss: [] as number[], train_acc: [] as number[], val_acc: [] as number[] };
  await head.fit(xTrain, yTrain, {
    epochs,
    batchSize: 32,
    validationData: [xVal, yVal],
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        curves.train_loss.push(logs?.loss ?? 0);
        curves.val_loss.push(logs?.val_loss ?? 0);
        curves.train_acc.push(logs?.acc ?? logs?.accuracy ?? 0);
        curves.val_acc.push(logs?.val_acc ?? logs?.val_accuracy ?? 0);
        onProgress?.({ stage: "fit", epoch: epoch + 1, total: epochs, logs: logs ?? undefined });
        await tf.nextFrame();
      },
    },
  });

  // 5) 검증셋 평가 → 혼동행렬·per-class
  const preds = tf.tidy(() => (head.predict(xVal) as tf.Tensor).argMax(1)) as tf.Tensor;
  const predIdx = Array.from(await preds.data()).map((v) => Number(v));
  preds.dispose();

  const confusion = Array.from({ length: numClasses }, () => new Array(numClasses).fill(0));
  for (let i = 0; i < valLabels.length; i++) confusion[valLabels[i]][predIdx[i]]++;

  const perClass: Record<string, PerClassMetric> = {};
  let f1Sum = 0;
  for (let c = 0; c < numClasses; c++) {
    const tp = confusion[c][c];
    const fp = confusion.reduce((s, row, r) => s + (r !== c ? row[c] : 0), 0);
    const fn = confusion[c].reduce((s, v, k) => s + (k !== c ? v : 0), 0);
    const precision = tp + fp ? tp / (tp + fp) : 0;
    const recall = tp + fn ? tp / (tp + fn) : 0;
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    perClass[classes[c]] = { precision, recall, f1 };
    f1Sum += f1;
  }
  const correct = confusion.reduce((s, row, r) => s + row[r], 0);
  const accuracy = valLabels.length ? correct / valLabels.length : 0;

  // 6) 모델 저장 (indexeddb)
  const modelUri = "indexeddb://astroml-model-" + Date.now();
  await head.save(modelUri);

  // cleanup
  [X, y, xTrain, yTrain, xVal, yVal].forEach((t) => t.dispose());

  const metrics: ResultMetrics = {
    task: "classification",
    classes,
    metrics: { accuracy, f1_macro: f1Sum / numClasses },
    confusion_matrix: confusion,
    per_class: perClass,
    curves,
    trained_with: "browser",
    backbone: "mobilenet_v2",
    split: { train: nTrain, val: nVal, seed },
  };
  return { metrics, modelUri };
}
