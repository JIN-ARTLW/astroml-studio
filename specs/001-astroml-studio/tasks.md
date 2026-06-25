---
description: "Task list for AstroML Studio v0 (001-astroml-studio)"
---

# Tasks: AstroML Studio — 노코드 천문 이미지 ML 연구툴

**Input**: Design documents from `specs/001-astroml-studio/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: 핵심 동선·계약 회귀를 보호하기 위해 **테스트 태스크 포함**(plan.md 테스트 전략 §10). 각 스토리 구현 전에 작성·실패 확인 권장.

**Organization**: 태스크는 사용자 스토리(US1~US5) 단위로 묶여 독립 구현·검증 가능.

## Format: `[ID] [P?] [Story] Description (file path)`

- **[P]**: 병렬 가능(다른 파일, 미완료 의존성 없음)
- **[USx]**: 해당 사용자 스토리. Setup/Foundational/Polish는 라벨 없음.
- **🔭**: 천문/우주과학 연구 실효성 검증 태스크(사용자 요청 반영).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Next.js 프로젝트 초기화 및 공통 기반. (레포에는 이미 docs/·specs/·.specify가 존재 — 앱 코드를 루트에 추가)

- [X] T001 Next.js(App Router, TypeScript) 프로젝트를 레포 루트에 초기화 (`package.json`, `tsconfig.json`, `next.config.ts`, `app/`)
- [X] T002 [P] Tailwind CSS + shadcn/ui 설정 (`components.json`, `app/globals.css`, `components/ui/`)
- [X] T003 [P] ESLint/Prettier 설정 (`.eslintrc`, `.prettierrc`)
- [X] T004 [P] Vitest + React Testing Library 설정 (`vitest.config.ts`, `tests/unit/`)
- [X] T005 [P] Playwright e2e 설정 (`playwright.config.ts`, `tests/e2e/`)
- [X] T006 [P] 핵심 의존성 설치: `@tensorflow/tfjs`, `dexie`, `recharts` (`package.json`)
- [X] T007 [P] 디자인 토큰 바인딩: getdesign.md **Linear**(워크벤치)+**Notion**(온보딩)을 단일 토큰 소스로 매핑, 라이트/다크 + 다크 우선 이미지 뷰어 (`lib/design/tokens.ts`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 사용자 스토리가 의존하는 코어. ⚠️ 완료 전 스토리 착수 불가.

- [X] T008 작업 플러그인 인터페이스/타입 정의 — 7 슬롯 (`lib/tasks/types.ts`, contracts/task-plugin.md 준수)
- [X] T009 작업 레지스트리(플러그인 조회, 하드코딩 금지) (`lib/tasks/registry.ts`)
- [X] T010 [P] Dexie 스키마/스토어 정의 — projects/images/labels/runs/results (`lib/store/db.ts`, data-model.md)
- [X] T011 LocalStore API 구현 — CRUD·진행률·용량추정 (`lib/store/index.ts`, contracts/local-store.md) (T010 의존)
- [X] T012 [P] result-schema 검증기 구현 (`lib/ml/result-schema.ts`, contracts/result-schema.json)
- [X] T013 [P] 앱 셸/레이아웃 + 테마(라이트/다크) 프로바이더 (`app/layout.tsx`, `components/theme/`)
- [X] T014 [P] 한국어 문자열 베이스라인 i18n (`lib/i18n/ko.ts`, FR-031)
- [X] T015 프로젝트 흐름 라우팅 스켈레톤 (`app/page.tsx`, `app/new/`, `app/project/[id]/{data,label,train,result,predict}/`)
- [X] T016 [P] 빈/로딩/오류 상태 + 토스트 프리미티브 (`components/ui/states.tsx`)

**Checkpoint**: 코어 준비 완료 — 사용자 스토리 착수 가능.

---

## Phase 3: User Story 1 - 코드 없이 이미지 분류기 만들기 (Priority: P1) 🎯 MVP

**Goal**: ML 비전공자가 데모/업로드 이미지로 분류기를 학습·예측까지 코드 없이 완주.

**Independent Test**: 데모 3클래스로 프로젝트 생성→학습→예측 완주, 혼동행렬·검증정확도(≥0.80) 표시 (quickstart S1/S2).

### Tests for User Story 1 ⚠️ (먼저 작성·실패 확인)

- [X] T017 [P] [US1] Vitest: TaskPlugin 계약(C1~C4) 테스트 (`tests/unit/task-plugin.contract.test.ts`)
- [X] T018 [P] [US1] Vitest: result-schema 검증 테스트 (`tests/unit/result-schema.test.ts`)
- [X] T019 [P] [US1] Playwright e2e: S1 전체 동선(데모→학습→예측) (`tests/e2e/us1-flow.spec.ts`)

### Implementation for User Story 1

- [X] T020 [P] [US1] 데모 데이터셋 번들 — 은하 3클래스(smooth-round/edge-on-disk/spiral) PNG + manifest + 출처/라이선스 (`public/demo/`, FR-028)
- [X] T021 [US1] 분류 플러그인 구현 — input/LabelEditor/head/loss/metrics (`lib/tasks/classification/index.tsx`, task-plugin v0 값)
- [X] T022 [US1] 새 프로젝트 화면 — 작업 선택(분류 active, 나머지 coming-soon)·클래스 정의 (`app/new/page.tsx`, FR-001/002)
- [X] T023 [US1] 데이터 화면 — 데모 불러오기 + 업로드(폴더명 자동 라벨, 손상 항목 스킵+사유) (`app/project/[id]/data/page.tsx`, FR-004/005/006)
- [X] T024 [US1] 라벨링 갤러리 — 클래스 버튼·숫자 단축키·진행률 (`app/project/[id]/label/page.tsx`, `components/gallery/`, FR-009/010)
- [X] T025 [US1] 브라우저 학습 엔진 — MobileNetV2 임베딩(캐시)+Dense 헤드, train/val 자동분할 (`lib/ml/train.ts`, FR-012/013)
- [X] T026 [US1] 학습 사전검사 가드 — 라벨 없음·클래스당 표본 부족 안내 (`lib/ml/guards.ts`, FR-015)
- [X] T027 [US1] 학습 화면 — 에폭별 정확도/손실 라이브 차트 (`app/project/[id]/train/page.tsx`, `components/charts/`, FR-014)
- [X] T028 [US1] 분류 evaluate() → result-schema(정확도·혼동행렬·per-class·곡선) (`lib/tasks/classification/evaluate.ts`, FR-020)
- [X] T029 [US1] 결과 화면 — 혼동행렬·클래스별 지표·곡선·오분류 갤러리(다크 뷰어) (`app/project/[id]/result/page.tsx`, `components/viewer/`, FR-020)
- [X] T030 [US1] 예측 화면 — 새 이미지→클래스+신뢰도 top-k (`app/project/[id]/predict/page.tsx`, FR-021)
- [X] T031 [US1] 내보내기 — TF.js 모델 + 지표 CSV (`lib/ml/export.ts`, FR-022)
- [X] T032 [US1] 전 동선 IndexedDB 영속화 + 재방문 유지 검증 (`lib/store/` 연동, SC-010)
- [X] T033 🔭 [US1] 천문 실효성 검증 — 데모가 실제 은하 형태분류 과제인지 + 다크 뷰어 천체 판독 적합성 확인 (quickstart 천문 게이트)

**Checkpoint**: US1 = 배포 가능한 MVP (H1/H2 증명).

---

## Phase 4: User Story 2 - 외부 무료 GPU로 본격 학습 핸드오프 (Priority: P2)

**Goal**: 동일 데이터·라벨로 노트북 자동생성 → 외부 GPU 실행 → 결과 업로드·비교.

**Independent Test**: 노트북 생성·실행→result.json 업로드→브라우저 결과와 동일형식 비교, 불일치 업로드는 거부 (quickstart S7).

### Tests for User Story 2 ⚠️

- [ ] T034 [P] [US2] Vitest: notebook-handoff 계약(N1~N4)·업로드 불일치 거부 (`tests/unit/notebook-handoff.test.ts`)

### Implementation for User Story 2

- [ ] T035 [US2] .ipynb 생성기 — nbformat v4, 클래스·데이터참조·설정 주입, result.json 출력 규약 (`lib/notebook/generate.ts`, FR-016)
- [ ] T036 [US2] 분류 notebookTemplate() — EfficientNet 파인튜닝 셀 (`lib/tasks/classification/notebook.ts`, seed 주입)
- [ ] T037 [US2] 노트북 생성 UI — 다운로드 + "Open in Colab"(Gist 선택) (`app/project/[id]/train/` 내 액션, FR-016)
- [ ] T038 [US2] 외부 결과 업로드 + 스키마/설정 일치 검증(불일치 거부) (`lib/store/external-result.ts`, FR-017/019)
- [ ] T039 [US2] 비교 뷰 — 브라우저 vs 외부 결과 동일 형식 렌더 (`app/project/[id]/result/compare.tsx`, FR-018/SC-006)
- [ ] T040 [US2] 규모 상한 배너 — >~1,500장 시 외부 GPU 권유 (`components/ScaleBanner.tsx`, FR-029/SC-009)
- [ ] T041 🔭 [US2] 천문 실효성 검증 — 생성 노트북이 무료 GPU에서 무수정 실행 + astropy/PyTorch 생태계 연결 확인

**Checkpoint**: US1+US2 독립 동작. 무료로 본격 학습까지 가능.

---

## Phase 5: User Story 3 - 천문 원본(FITS) 입력과 전처리 (Priority: P3)

**Goal**: FITS 업로드·WCS 인식·천문 전처리(배경제거·소스추출·stretch)를 노코드로 적용.

**Independent Test**: FITS 업로드→메타 인식→전처리 전/후 프리뷰→분류 학습까지 연결 (quickstart S? / spec US3).

### Tests for User Story 3 ⚠️

- [ ] T042 [P] [US3] Vitest: FITS 디코드 + WCS 메타 파싱 (`tests/unit/fits.test.ts`)

### Implementation for User Story 3

- [ ] T043 [US3] FITS 로더 + WCS 메타 인식 (`lib/astro/fits.ts`, FR-007)
- [ ] T044 [US3] 천문 전처리 — 배경 제거·소스 추출·비선형 stretch + 전/후 프리뷰 (`lib/astro/preprocess.ts`, `components/viewer/`, FR-008)
- [ ] T045 [US3] FITS 경로를 데이터/라벨/학습 흐름에 연결 (`input.accepts: ['image','fits','meta']`) (`lib/tasks/classification/`, `app/project/[id]/data/`)
- [ ] T046 🔭 [US3] 천문 실효성 검증 — 실제 FITS 샘플로 end-to-end 적용 + 관측천문 stretch 관례 적합성

**Checkpoint**: 범용 ML 툴 대비 결정적 차별(천문 도메인) 확보.

---

## Phase 6: User Story 4 - 작업 유형 확장(검출·회귀·이상) (Priority: P4)

**Goal**: 분류와 동일 흐름으로 추가 작업 수행 — 추상화(SC-007) 검증.

**Independent Test**: 회귀 등 신규 플러그인 등록만으로 동일 6화면 흐름 동작, 코어 변경 0 (quickstart S8).

### Tests for User Story 4 ⚠️

- [ ] T047 [P] [US4] Vitest: 신규 플러그인 등록이 코어 변경 0임을 검증 (`tests/unit/plugin-extension.test.ts`, SC-007)

### Implementation for User Story 4

- [ ] T048 [US4] 회귀 플러그인 — 스칼라 라벨 UI·linear 헤드·mse·RMSE/MAE (`lib/tasks/regression/index.tsx`, FR-011/023)
- [ ] T049 [P] [US4] 검출 플러그인 — 박스 라벨링·mAP (`lib/tasks/detection/index.tsx`, FR-011/023)
- [ ] T050 [P] [US4] 세그멘테이션·이상탐지 플러그인 — 마스크/토글 라벨·IoU/AUROC (`lib/tasks/segmentation/`, `lib/tasks/anomaly/`, FR-011/023)
- [ ] T051 [US4] 구현된 작업을 새 프로젝트 UI에서 활성화(coming-soon 해제) (`app/new/page.tsx`, FR-001)
- [ ] T052 🔭 [US4] 천문 실효성 검증 — photo-z 회귀 데모 경로가 실제 천문 회귀 문제로 유의미한지 확인

**Checkpoint**: "한 툴에서 다 된다" 비전 검증.

---

## Phase 7: User Story 5 - 과학적 신뢰성 리포트 (Priority: P5)

**Goal**: 재현성 정보·데이터 누수 경고로 연구/교육 신뢰성 확보.

**Independent Test**: 결과 리포트에 재현 정보 포함, 누수 상황에서 경고 표시 (spec US5).

### Tests for User Story 5 ⚠️

- [ ] T053 [P] [US5] Vitest: 데이터 누수(train/val 중복) 감지 (`tests/unit/leakage.test.ts`)

### Implementation for User Story 5

- [ ] T054 [US5] 재현성 리포트 — 분할·하이퍼파라미터·데이터셋 식별을 result에 기록·표시 (`lib/ml/report.ts`, `app/project/[id]/result/`, FR-024)
- [ ] T055 [US5] 데이터 누수 감지 + 경고 (`lib/ml/leakage.ts`, FR-025)

**Checkpoint**: 논문/현업 신뢰성 요건 충족.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T056 [P] 저장 용량 모니터링 + 정리/내보내기 UI (`components/StorageGuard.tsx`, FR-030)
- [ ] T057 [P] 접근성 + 모바일 반응형 점검 (전 화면)
- [ ] T058 [P] PWA/1차 로드 후 오프라인(선택) (`public/manifest.json`, service worker)
- [ ] T059 [P] 한국어 카피 전수 검토 (`lib/i18n/ko.ts`, FR-031)
- [ ] T060 [P] README/docs 실행 안내 갱신 (`README.md`, `docs/`)
- [ ] T061 quickstart.md S1~S8 전체 검증 실행
- [ ] T062 🔭 천문 실효성 최종 점검 — plan.md "천문 연구 실효성 검증표" 8개 항목 전부 충족 확인

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup(P1)**: 의존 없음.
- **Foundational(P2)**: Setup 완료 후. 모든 스토리 차단.
- **US1(P3)**: Foundational 후 — MVP.
- **US2~US5**: Foundational 후 착수 가능. US2~US5는 US1 컴포넌트(플러그인·store·result-schema)를 재사용하나 독립 검증 가능하게 설계.
- **Polish(P8)**: 원하는 스토리 완료 후.

### User Story Dependencies

- US1: 독립(코어만 의존).
- US2: result-schema·classification 플러그인 재사용(US1 산출 권장) — 단 핸드오프 자체는 독립 테스트 가능.
- US3: classification 흐름에 FITS 입력 추가 — US1 흐름 위에 얹힘.
- US4: 작업 레지스트리(P2)만으로 신규 플러그인 추가 — US1과 병렬 가능.
- US5: result/report에 부가 — US1 결과 화면 위에 얹힘.

### Within Each Story

- 테스트(작성·실패) → 모델/스토어 → 서비스/엔진 → 화면 → 통합 → 🔭 실효성 검증.

### Parallel Opportunities

- Setup의 T002~T007 [P] 병렬.
- Foundational의 T010/T012/T013/T014/T016 [P] 병렬.
- US1 테스트 T017~T019 [P] 병렬; T020(데모 번들) 병렬.
- Foundational 완료 후 US1·US4를 서로 다른 인원이 병렬 진행 가능.

---

## Parallel Example: User Story 1

```bash
# US1 테스트 동시 작성:
Task: "Vitest TaskPlugin 계약 tests/unit/task-plugin.contract.test.ts"
Task: "Vitest result-schema tests/unit/result-schema.test.ts"
Task: "Playwright S1 e2e tests/e2e/us1-flow.spec.ts"

# US1 독립 자원 동시:
Task: "데모 데이터 번들 public/demo/"
```

---

## Implementation Strategy

### MVP First (US1)
1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 US1 → **검증(S1/S2)** → 데모/배포.

### Incremental Delivery
Setup+Foundational → US1(MVP) → US2(무료 GPU) → US3(FITS 차별화) → US4(작업확장) → US5(신뢰성). 각 단계 독립 배포·검증.

### 천문 실효성 게이트 (요청 반영)
각 스토리의 🔭 태스크(T033/T041/T046/T052/T062)를 해당 Phase 종료 조건으로 둔다 — 기능 완성과 별개로 "천문 연구에 실질 효과가 있는가"를 통과해야 다음 단계로 이동.

---

## Notes

- [P] = 다른 파일·의존성 없음. [USx] = 스토리 추적.
- 각 스토리는 독립 완료·검증 가능. 테스트는 구현 전 실패 확인.
- 태스크 또는 논리 단위마다 커밋.
- 체크포인트에서 스토리 독립 검증 후 진행.
- 회피: 모호한 태스크, 동일 파일 충돌, 독립성 깨는 교차 의존.
