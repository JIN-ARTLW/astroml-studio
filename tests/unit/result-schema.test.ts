import { describe, it, expect } from "vitest";
import { validateResult, matchesProject, type ResultMetrics } from "@/lib/ml/result-schema";

const valid: ResultMetrics = {
  task: "classification",
  classes: ["a", "b"],
  metrics: { accuracy: 0.9, f1_macro: 0.88 },
  trained_with: "browser",
};

describe("validateResult", () => {
  it("유효한 결과는 통과(null)", () => {
    expect(validateResult(valid)).toBeNull();
  });
  it("task 누락 시 오류", () => {
    expect(validateResult({ ...valid, task: undefined })).not.toBeNull();
  });
  it("metrics 값이 숫자가 아니면 오류", () => {
    expect(validateResult({ ...valid, metrics: { accuracy: "x" } })).not.toBeNull();
  });
  it("trained_with 잘못되면 오류", () => {
    expect(validateResult({ ...valid, trained_with: "gpu" })).not.toBeNull();
  });
});

describe("matchesProject (외부 업로드 일치 검증, FR-019)", () => {
  it("작업·클래스 일치 시 통과", () => {
    expect(matchesProject(valid, { taskKind: "classification", classes: ["a", "b"] })).toBeNull();
  });
  it("클래스 불일치 시 거부", () => {
    expect(matchesProject(valid, { taskKind: "classification", classes: ["a", "c"] })).not.toBeNull();
  });
  it("작업 불일치 시 거부", () => {
    expect(matchesProject(valid, { taskKind: "regression", classes: ["a", "b"] })).not.toBeNull();
  });
});
