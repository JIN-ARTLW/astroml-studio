// 작업 레지스트리 (C3/C4). 코어는 특정 작업을 하드코딩하지 않고 여기서 조회.
// 새 작업 추가 = 플러그인 구현 + 이 배열에 등록 (코어 변경 0, SC-007).
import type { TaskKind, TaskPlugin, TaskRegistry, LabelValue } from "./types";
import { classificationPlugin } from "./classification";

// US4에서 채울 coming-soon 슬롯 (인터페이스만 유지).
function comingSoon(kind: TaskKind, title: string): TaskPlugin {
  return {
    kind,
    title,
    status: "coming-soon",
    input: { accepts: ["image"] },
    head: { units: "dynamic", activation: "softmax" },
    loss: "categoricalCrossentropy",
    metrics: [],
    validateLabel: (_v: LabelValue, _c: string[]) => false,
  };
}

const PLUGINS: TaskPlugin[] = [
  classificationPlugin,
  comingSoon("detection", "객체 검출"),
  comingSoon("segmentation", "세그멘테이션"),
  comingSoon("regression", "물리량 회귀"),
  comingSoon("anomaly", "이상 탐지"),
];

export const registry: TaskRegistry = {
  get: (kind) => PLUGINS.find((p) => p.kind === kind),
  list: () => PLUGINS,
  active: () => PLUGINS.filter((p) => p.status === "active"),
};
