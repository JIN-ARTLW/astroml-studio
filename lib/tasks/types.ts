// 작업 플러그인 인터페이스 (contracts/task-plugin.md)
// v0는 classification만 active. 나머지는 coming-soon 슬롯.
import type { ResultMetrics } from "@/lib/ml/result-schema";

export type TaskKind =
  | "classification"
  | "detection"
  | "segmentation"
  | "regression"
  | "anomaly";

export interface MetricSpec {
  key: string;
  label: string;
}

// 작업별 라벨 값 (data-model.md Label.value)
export type LabelValue =
  | { kind: "classification"; class: string }
  | { kind: "regression"; value: number }
  | { kind: "anomaly"; label: "normal" | "anomaly" }
  | { kind: "detection"; boxes: Array<{ x: number; y: number; w: number; h: number; class?: string }> };

export interface HeadSpec {
  units: number | "dynamic"; // 분류=클래스수, 회귀=1
  activation: "softmax" | "sigmoid" | "linear";
}

export interface NotebookSpec {
  filename: string;
  ipynb: unknown; // nbformat v4 JSON (US2)
}

// 코어는 이 인터페이스에만 의존 (C3). React 컴포넌트는 plugin이 직접 들고 있지 않고
// UI 레이어에서 kind로 분기하여 결합도를 낮춘다(번들 분리).
export interface TaskPlugin {
  kind: TaskKind;
  title: string; // 한국어 (FR-031)
  status: "active" | "coming-soon"; // FR-001

  input: { accepts: Array<"image" | "fits" | "meta"> };
  head: HeadSpec;
  loss: "categoricalCrossentropy" | "binaryCrossentropy" | "mse";
  metrics: MetricSpec[];

  // 라벨 유효성 (예: 분류 class ∈ classes)
  validateLabel(value: LabelValue, classes: string[]): boolean;
}

export interface TaskRegistry {
  get(kind: TaskKind): TaskPlugin | undefined;
  list(): TaskPlugin[];
  active(): TaskPlugin[];
}

export type { ResultMetrics };
