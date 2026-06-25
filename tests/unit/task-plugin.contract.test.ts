import { describe, it, expect } from "vitest";
import { registry } from "@/lib/tasks/registry";
import { checkTrainReady } from "@/lib/ml/guards";

describe("Task plugin 계약 (contracts/task-plugin.md)", () => {
  it("C2: classification만 active, 나머지는 coming-soon", () => {
    const active = registry.active();
    expect(active).toHaveLength(1);
    expect(active[0].kind).toBe("classification");
    expect(registry.list().length).toBeGreaterThanOrEqual(5);
  });

  it("C3: 레지스트리에서 kind로 조회 가능", () => {
    expect(registry.get("classification")?.status).toBe("active");
    expect(registry.get("regression")?.status).toBe("coming-soon");
  });

  it("classification validateLabel: class ∈ classes", () => {
    const p = registry.get("classification")!;
    expect(p.validateLabel({ kind: "classification", class: "a" }, ["a", "b"])).toBe(true);
    expect(p.validateLabel({ kind: "classification", class: "z" }, ["a", "b"])).toBe(false);
  });

  it("head/loss/metrics 슬롯이 채워져 있음", () => {
    const p = registry.get("classification")!;
    expect(p.head.activation).toBe("softmax");
    expect(p.loss).toBe("categoricalCrossentropy");
    expect(p.metrics.length).toBeGreaterThan(0);
  });
});

describe("학습 가드 (FR-015)", () => {
  it("라벨 0이면 차단", () => {
    expect(checkTrainReady({ labeledCount: 0, perClassCount: {} }).ok).toBe(false);
  });
  it("클래스 1개면 차단", () => {
    expect(checkTrainReady({ labeledCount: 10, perClassCount: { a: 10 } }).ok).toBe(false);
  });
  it("2클래스 이상이면 통과(표본 부족은 경고)", () => {
    const r = checkTrainReady({ labeledCount: 12, perClassCount: { a: 6, b: 6 } });
    expect(r.ok).toBe(true);
    expect(r.messages.length).toBeGreaterThan(0); // 10장 미만 경고
  });
});
