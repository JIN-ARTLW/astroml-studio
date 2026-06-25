// 내보내기 (FR-022): 모델(TF.js) + 지표 CSV.
"use client";
import * as tf from "@tensorflow/tfjs";
import type { ResultMetrics } from "./result-schema";

export async function exportModel(modelUri: string, name = "astroml-model") {
  const model = await tf.loadLayersModel(modelUri);
  await model.save(`downloads://${name}`);
}

export function metricsToCsv(m: ResultMetrics): string {
  const lines: string[] = [];
  lines.push("metric,value");
  for (const [k, v] of Object.entries(m.metrics)) lines.push(`${k},${v.toFixed(4)}`);
  lines.push("");
  lines.push("class,precision,recall,f1");
  for (const [c, pc] of Object.entries(m.per_class ?? {})) {
    lines.push(`${c},${pc.precision.toFixed(4)},${pc.recall.toFixed(4)},${pc.f1.toFixed(4)}`);
  }
  return lines.join("\n");
}

export function downloadCsv(csv: string, filename = "metrics.csv") {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
