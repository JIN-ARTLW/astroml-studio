/**
 * 디자인 토큰 메타 (단일 소스: app/globals.css CSS 변수).
 * plan.md "외부 리소스 바인딩 B" 결정 반영:
 *   - 워크벤치 표면(라벨/학습/결과): Linear 테마 톤 (precise, dark-friendly)
 *   - 온보딩 표면(홈/새 프로젝트/안내): Notion 테마 톤 (warm, soft)
 *   - 천문 이미지 뷰어: 항상 다크 (관측천문 관례)
 *
 * getdesign.md 참조:
 *   npx getdesign@latest add linear   // https://getdesign.md/linear.app/design-md
 *   npx getdesign@latest add notion   // https://getdesign.md/notion/design-md
 */
export type Surface = "onboarding" | "workbench" | "viewer";

export const THEME_BINDING = {
  onboarding: { name: "Notion", url: "https://getdesign.md/notion/design-md" },
  workbench: { name: "Linear", url: "https://getdesign.md/linear.app/design-md" },
  viewer: { name: "Dark (astro)", note: "DS9/Aladin 관례 — 항상 다크 캔버스" },
} as const;
