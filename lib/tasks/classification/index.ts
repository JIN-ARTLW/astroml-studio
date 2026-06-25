// v0 분류 플러그인 (contracts/task-plugin.md "v0 classification 구현 값").
import type { TaskPlugin, LabelValue } from "@/lib/tasks/types";

export const classificationPlugin: TaskPlugin = {
  kind: "classification",
  title: "이미지 분류",
  status: "active",
  input: { accepts: ["image"] }, // P3에서 'fits','meta' 추가
  head: { units: "dynamic", activation: "softmax" },
  loss: "categoricalCrossentropy",
  metrics: [
    { key: "accuracy", label: "정확도" },
    { key: "f1_macro", label: "F1(macro)" },
  ],
  validateLabel(value: LabelValue, classes: string[]): boolean {
    return value.kind === "classification" && classes.includes(value.class);
  },
};
