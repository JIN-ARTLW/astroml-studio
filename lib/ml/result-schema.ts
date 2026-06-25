// 표준 결과 형식 (contracts/result-schema.json). 브라우저/노트북 공용 (FR-018, SC-006).
import type { TaskKind } from "@/lib/tasks/types";

export interface PerClassMetric {
  precision: number;
  recall: number;
  f1: number;
}

export interface ResultCurves {
  train_loss?: number[];
  val_loss?: number[];
  train_acc?: number[];
  val_acc?: number[];
}

export interface ResultMetrics {
  task: TaskKind;
  classes: string[];
  metrics: Record<string, number>; // 분류: accuracy, f1_macro / 회귀: rmse, mae
  confusion_matrix?: number[][];
  per_class?: Record<string, PerClassMetric>;
  curves?: ResultCurves;
  trained_with: "browser" | "external";
  backbone?: string;
  split?: { train: number; val: number; seed: number };
  warnings?: string[];
}

const TASKS = ["classification", "detection", "segmentation", "regression", "anomaly"];

/** result-schema 검증 (S2 of local-store, FR-019). 통과 시 null, 실패 시 사유 배열. */
export function validateResult(obj: unknown): string[] | null {
  const errors: string[] = [];
  if (typeof obj !== "object" || obj === null) return ["결과가 객체가 아닙니다."];
  const r = obj as Record<string, unknown>;

  if (typeof r.task !== "string" || !TASKS.includes(r.task)) errors.push("task가 유효하지 않습니다.");
  if (!Array.isArray(r.classes)) errors.push("classes가 배열이 아닙니다.");
  if (typeof r.metrics !== "object" || r.metrics === null) errors.push("metrics가 없습니다.");
  else {
    for (const [k, v] of Object.entries(r.metrics as Record<string, unknown>)) {
      if (typeof v !== "number") errors.push(`metrics.${k}는 숫자가 아닙니다.`);
    }
  }
  if (r.trained_with !== "browser" && r.trained_with !== "external")
    errors.push("trained_with는 'browser' 또는 'external'이어야 합니다.");
  if (r.confusion_matrix !== undefined && !Array.isArray(r.confusion_matrix))
    errors.push("confusion_matrix가 배열이 아닙니다.");

  return errors.length ? errors : null;
}

/** 외부 업로드 결과와 프로젝트 설정 일치 검증 (FR-019, notebook-handoff N2). */
export function matchesProject(
  result: ResultMetrics,
  project: { taskKind: TaskKind; classes: string[] }
): string[] | null {
  const errors: string[] = [];
  if (result.task !== project.taskKind) errors.push("작업 유형이 프로젝트와 다릅니다.");
  const set = new Set(project.classes);
  if (result.classes.length !== project.classes.length || !result.classes.every((c) => set.has(c)))
    errors.push("클래스 구성이 프로젝트와 다릅니다.");
  return errors.length ? errors : null;
}
