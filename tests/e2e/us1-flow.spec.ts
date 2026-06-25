import { test, expect } from "@playwright/test";

// US1 핵심 동선 (quickstart S1/S2/S3). 합성 데모로 학습→예측 완주 + 영속성.
test("US1: 데모로 분류기 학습·예측 완주", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /예시.*바로 해보기/ }).click();

  // 데이터 화면(?demo=1) — 자동 로드 후 이미지 표시
  await expect(page.getByText(/이미지 \d+장/)).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: /다음:/ }).click();

  // 라벨링 — 데모 자동 라벨 → 바로 학습으로
  await page.getByRole("button", { name: /다음:/ }).click();

  // 학습
  await page.getByRole("button", { name: /학습 시작/ }).click();

  // 결과 화면으로 이동 + 검증 정확도 표시
  await expect(page).toHaveURL(/\/result$/, { timeout: 90_000 });
  await expect(page.getByText(/검증 정확도/)).toBeVisible();
});

test("US1: 재방문 시 프로젝트 영속 (SC-010)", async ({ page }) => {
  await page.goto("/");
  // 이전 테스트에서 만든 프로젝트가 목록에 남아 있어야 함
  await expect(page.getByText(/예시: 은하 형태분류/)).toBeVisible();
});
