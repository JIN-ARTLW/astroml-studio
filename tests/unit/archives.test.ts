import { describe, it, expect } from "vitest";
import { legacyCutoutUrl, sdssCutoutUrl } from "@/lib/astro/archives";
import { CURATED_GALAXIES } from "@/lib/demo/curatedGalaxies";

const DEMO_CLASSES = ["smooth-round", "edge-on-disk", "spiral"];

describe("아카이브 컷아웃 URL", () => {
  it("Legacy: ra/dec/pixscale/size 반영", () => {
    const u = legacyCutoutUrl(202.47, 47.19, { size: 256, pixscale: 1.2 });
    expect(u).toContain("legacysurvey.org");
    expect(u).toContain("ra=202.47");
    expect(u).toContain("dec=47.19");
    expect(u).toContain("pixscale=1.2");
  });
  it("SDSS: ra/dec/scale 반영", () => {
    const u = sdssCutoutUrl(180, 0, { size: 128, pixscale: 0.4 });
    expect(u).toContain("skyserver.sdss.org");
    expect(u).toContain("ra=180");
    expect(u).toContain("scale=0.4");
  });
});

describe("큐레이션 은하 목록", () => {
  it("3개 클래스가 모두 충분히 존재(각 ≥4)", () => {
    for (const c of DEMO_CLASSES) {
      const n = CURATED_GALAXIES.filter((g) => g.cls === c).length;
      expect(n).toBeGreaterThanOrEqual(4);
    }
  });
  it("좌표가 유효 범위", () => {
    for (const g of CURATED_GALAXIES) {
      expect(g.ra).toBeGreaterThanOrEqual(0);
      expect(g.ra).toBeLessThan(360);
      expect(g.dec).toBeGreaterThanOrEqual(-90);
      expect(g.dec).toBeLessThanOrEqual(90);
    }
  });
});
