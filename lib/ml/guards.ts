// 학습 사전검사 (FR-015). 데이터 누수 기초 점검은 P5(leakage.ts)에서 확장.
import { ko } from "@/lib/i18n/ko";

export interface GuardInput {
  labeledCount: number;
  perClassCount: Record<string, number>;
}

export function checkTrainReady(input: GuardInput): { ok: boolean; messages: string[] } {
  const messages: string[] = [];
  if (input.labeledCount === 0) {
    messages.push(ko.train.guardNoLabel);
    return { ok: false, messages };
  }
  const classes = Object.keys(input.perClassCount);
  if (classes.length < 2) {
    messages.push("학습에는 최소 2개 클래스가 필요합니다.");
  }
  for (const [c, n] of Object.entries(input.perClassCount)) {
    if (n < 10) messages.push(ko.train.guardFew(c, n));
  }
  // 표본 부족은 경고이되 차단하지 않음(학생 데모 현실). 클래스/라벨 부재만 차단.
  const blocking = input.labeledCount === 0 || classes.length < 2;
  return { ok: !blocking, messages };
}
