// 예측 (FR-021): 새 이미지 → 클래스 + 신뢰도 top-k.
"use client";
import * as tf from "@tensorflow/tfjs";
import { loadBackbone, embed } from "./backbone";

export interface Prediction {
  class: string;
  confidence: number;
}

export async function predict(modelUri: string, classes: string[], blob: Blob, topK = 3): Promise<Prediction[]> {
  const backbone = await loadBackbone();
  const head = await tf.loadLayersModel(modelUri);
  const emb = await embed(backbone, blob);
  const probs = tf.tidy(() => (head.predict(emb) as tf.Tensor).dataSync());
  emb.dispose();
  const arr = Array.from(probs).map((p, i) => ({ class: classes[i] ?? `class_${i}`, confidence: p }));
  return arr.sort((a, b) => b.confidence - a.confidence).slice(0, topK);
}
