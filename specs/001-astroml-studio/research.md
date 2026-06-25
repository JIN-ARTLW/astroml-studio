# Research: AstroML Studio (Phase 0)

명세·캔버스의 미해결 기술 선택을 해소한다. 각 항목: **Decision / Rationale / Alternatives**.

## 1. 브라우저 ML 런타임

**Decision**: **TensorFlow.js** + 사전학습 백본(**MobileNetV2**) **특징추출(고정) + 경량 Dense 헤드 학습**. 임베딩은 1회 계산 후 캐시해 에폭 반복을 가속.

**Rationale**: 설치 0·서버 0으로 브라우저에서 학습 가능(SC-004). 백본 고정 + 헤드만 학습하면 ~1,500장 규모를 일반 학생 기기에서 처리 가능(SC-009). 천문 ML에서 전이학습은 표준 베이스라인이라 실효성 있음.

**Alternatives**:
- ONNX Runtime Web — 추론 강점이나 브라우저 학습 생태계 빈약.
- transformers.js — 대형 모델 추론 중심, 경량 분류 학습엔 과함.
- 풀 파인튜닝(브라우저) — 메모리/속도 한계로 부적합 → 노트북 경로(P2)로 위임.

## 2. 로컬 영속화 (v0 무백엔드)

**Decision**: **IndexedDB**(래퍼 **Dexie**). 이미지는 Blob로, 라벨/설정/결과는 구조화 레코드로 저장. 썸네일 별도 캐시.

**Rationale**: 명세 확정(브라우저 로컬 우선, SC-010). localStorage는 용량(~5MB)·동기 API로 이미지 부적합. IndexedDB는 대용량 Blob·트랜잭션 지원. Dexie로 스키마·쿼리 단순화.

**Alternatives**: OPFS(파일시스템) — 강력하나 API 복잡·지원 편차; raw IndexedDB — 보일러플레이트 많음; localStorage — 용량 부족.

## 3. 노트북(.ipynb) 자동 생성 + 핸드오프

**Decision**: **nbformat v4 JSON을 프로그램적으로 생성**. 프로젝트의 클래스·데이터 참조·설정을 셀에 주입. 사용자에게 **(a) .ipynb 다운로드** 및 **(b) GitHub Gist 업로드 → "Open in Colab" 링크** 제공(Gist는 사용자 토큰 선택). 데이터는 사용자가 zip 업로드 또는 공개 URL로 로드.

**Rationale**: 마켓플레이스 스킬 없음 → 직접 생성. nbformat은 안정 스펙. Colab은 무료 GPU 접근성 최고. astropy/PyTorch 생태계로 자연 연결되어 논문급 재현 가능(천문 실효성).

**Alternatives**: 순수 다운로드만(편의↓), 서버측 실행(무료 위배), Kaggle 커널(대안으로 병행 가능).

## 4. 표준 결과 스키마 (브라우저 ↔ 노트북 공용)

**Decision**: 단일 **`result.json`** 스키마(작업·클래스·지표·혼동행렬·실행위치·백본). 브라우저/노트북 결과 모두 이 형식으로 산출 → 결과 화면이 출처 무관하게 동일 렌더(FR-018). 계약: [contracts/result-schema.json](./contracts/result-schema.json).

**Rationale**: 두 경로 UI 통합·비교(SC-006). 향후 작업별 지표 확장 용이.

**Alternatives**: 경로별 별도 포맷(중복·분기 증가) → 기각.

## 5. 데모 데이터셋

**Decision**: **Galaxy10 DECaLS**에서 시각적으로 뚜렷한 **3클래스(smooth-round / edge-on-disk / spiral) 서브셋**(클래스당 ~300–500장)을 **사전 추출해 PNG로 번들**(`public/demo/`). 출처·라이선스 표기(FR-028).

**Rationale**: ML 튜토리얼용으로 설계된 공개 셋 → 진입장벽 최저. 3클래스면 H2(정확도 ≥0.8) 검증 현실적이며 브라우저 규모 상한 내. 상세: [docs/datasets.md](../../docs/datasets.md).

**Alternatives**: Galaxy10 SDSS(저해상도·더 가벼움, 대안), 전체 10클래스(브라우저엔 과중).

## 6. 작업 플러그인 추상화

**Decision**: 7-슬롯 인터페이스(입력·라벨UI·헤드·손실·지표·노트북템플릿·결과뷰). v0는 `classification`만 구현, 나머지는 인터페이스만 유지. 계약: [contracts/task-plugin.md](./contracts/task-plugin.md).

**Rationale**: 가장 비싼 결정(R2). 일반형으로 선설계해 검출/회귀/이상 확장이 코어 변경 없이 가능(SC-007).

**Alternatives**: 분류 전용 하드코딩(확장 시 대수술) → 기각.

## 7. UI 디자인 시스템

**Decision**: **shadcn/ui + Tailwind** 단일 컴포넌트 기반에 **단일 디자인 토큰** 소스. getdesign.md의 **Linear**(워크벤치) + **Notion**(온보딩) 분석을 토큰에 매핑. **천문 이미지 뷰어는 다크 캔버스 + 과학 컬러맵** 기본.

**Rationale**: 일관성·중복 방지. 다크 뷰어는 천체 이미지 대비·관측천문 관례(DS9/Aladin)에 부합 → 실효성. 비전공 진입 표면은 Notion 톤으로 부담 완화.

**Alternatives**: 단일 테마만(진입 친화↓ 또는 데이터밀도↓), 커스텀 디자인(시간 비용↑).

## 8. 차트/시각화

**Decision**: **shadcn 차트(Recharts 기반)** 로 학습곡선·클래스별 지표, 혼동행렬은 경량 커스텀(heatmap). 오분류 갤러리는 이미지 그리드.

**Rationale**: shadcn 토큰과 일관, 추가 의존 최소. 혼동행렬은 표/heatmap이 직관적.

**Alternatives**: D3 직접(과함), Chart.js(토큰 일관성↓).

## 9. (P3) FITS/천문 전처리

**Decision**: `fitsjs`/wasm 디코더로 FITS 로드 + WCS 메타 인식, 전처리(배경 제거·소스 추출·비선형 stretch) 프리뷰. 직접 구현(`lib/astro/`).

**Rationale**: 범용 ML 툴과의 결정적 차별(천문 도메인). astropy/photutils 관례 참조.

**Alternatives**: 서버측 astropy(무료·무백엔드 위배) → 클라이언트 우선, 필요 시 노트북 경로 활용.

## 10. 테스트 전략

**Decision**: Vitest(플러그인 인터페이스·ML 유틸·store 단위) + Playwright(6화면 핵심 동선 e2e). 데모 데이터로 "프로젝트→예측" 완주 e2e가 H1/SC-001 회귀 가드.

**Rationale**: 핵심 가치(완주 가능성)를 자동 회귀로 보호.

**Alternatives**: 단위만(동선 회귀 놓침), 수동 QA만(반복비용↑).

---

**미해결 NEEDS CLARIFICATION**: 없음(클래리파이 단계에서 저장/규모/언어 확정).
