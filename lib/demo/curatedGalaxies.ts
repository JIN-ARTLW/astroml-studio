// 실데이터 데모용 큐레이션 은하 목록.
// 이미지는 SDSS/Legacy에서 라이브로 받아오고, 형태 라벨은 잘 알려진 분류(천문 표준 카탈로그/Galaxy Zoo 통념)에서 큐레이션.
// 좌표는 J2000 근사 — 컷아웃 중심용으로 충분. scale = arcsec/px (은하가 프레임을 적절히 채우도록 튜닝).
export interface CuratedGalaxy {
  name: string;
  ra: number;
  dec: number;
  cls: "smooth-round" | "edge-on-disk" | "spiral";
  scale: number;
}

export const CURATED_GALAXIES: CuratedGalaxy[] = [
  // 나선 (face-on spiral)
  { name: "M51 (Whirlpool)", ra: 202.4696, dec: 47.1952, cls: "spiral", scale: 1.2 },
  { name: "M101 (Pinwheel)", ra: 210.8025, dec: 54.349, cls: "spiral", scale: 1.6 },
  { name: "M99", ra: 184.7066, dec: 14.4164, cls: "spiral", scale: 0.8 },
  { name: "M100", ra: 185.7288, dec: 15.8222, cls: "spiral", scale: 0.9 },
  { name: "M61", ra: 185.4788, dec: 4.4736, cls: "spiral", scale: 0.8 },
  { name: "M63 (Sunflower)", ra: 198.9555, dec: 42.0293, cls: "spiral", scale: 1.0 },
  { name: "M94", ra: 192.7211, dec: 41.1206, cls: "spiral", scale: 0.8 },
  { name: "M74", ra: 24.1739, dec: 15.7836, cls: "spiral", scale: 1.0 },

  // 측면 원반 (edge-on disk)
  { name: "NGC 4565 (Needle)", ra: 189.0865, dec: 25.9876, cls: "edge-on-disk", scale: 1.3 },
  { name: "NGC 4631 (Whale)", ra: 190.5337, dec: 32.5415, cls: "edge-on-disk", scale: 1.2 },
  { name: "NGC 891", ra: 35.6392, dec: 42.349, cls: "edge-on-disk", scale: 1.1 },
  { name: "NGC 5746", ra: 221.2329, dec: 1.9547, cls: "edge-on-disk", scale: 0.9 },
  { name: "NGC 3628 (Hamburger)", ra: 170.0709, dec: 13.5896, cls: "edge-on-disk", scale: 1.1 },
  { name: "NGC 4216", ra: 183.9767, dec: 13.1489, cls: "edge-on-disk", scale: 0.9 },
  { name: "NGC 5907 (Splinter)", ra: 228.9742, dec: 56.3285, cls: "edge-on-disk", scale: 1.2 },
  { name: "NGC 4302", ra: 185.4267, dec: 14.597, cls: "edge-on-disk", scale: 0.8 },

  // 매끈한 타원/원형 (smooth round elliptical)
  { name: "M87", ra: 187.7059, dec: 12.3911, cls: "smooth-round", scale: 0.9 },
  { name: "M49", ra: 187.4448, dec: 8.0004, cls: "smooth-round", scale: 0.9 },
  { name: "M59", ra: 190.5097, dec: 11.6469, cls: "smooth-round", scale: 0.6 },
  { name: "M60", ra: 190.9165, dec: 11.5526, cls: "smooth-round", scale: 0.7 },
  { name: "M89", ra: 188.9159, dec: 12.5563, cls: "smooth-round", scale: 0.6 },
  { name: "M105", ra: 161.9568, dec: 12.5816, cls: "smooth-round", scale: 0.7 },
  { name: "M86", ra: 186.5493, dec: 12.9461, cls: "smooth-round", scale: 0.8 },
  { name: "M84", ra: 186.2655, dec: 12.887, cls: "smooth-round", scale: 0.6 },
];

// 아카이브 불러오기 패널의 천체명 빠른 선택용(좌표 포함)
export const FAMOUS_OBJECTS = CURATED_GALAXIES.map((g) => ({ name: g.name, ra: g.ra, dec: g.dec }));
