# Implementation Plan: AstroML Studio — 노코드 천문 이미지 ML 연구툴

**Branch**: `001-astroml-studio` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-astroml-studio/spec.md`

## Summary

천문 이미지에서 ML 지식 없이 결과를 얻게 하는 **노코드 웹 연구툴**. v0는 "분류" 작업을 end-to-end로 구현한다(P1). 기술 접근: **백엔드 없는 프론트엔드 단일 앱**(Next.js)에서 **브라우저 전이학습**(TensorFlow.js: 사전학습 백본 고정 + 경량 헤드 학습)으로 즉시 결과를 내고, 데이터·라벨·결과는 **브라우저 로컬(IndexedDB)** 에 보존한다. 규모(>~1,500장)나 본격 학습이 필요하면 **실행 가능한 노트북(.ipynb)을 자동 생성**해 사용자의 무료 외부 GPU(Colab/Kaggle)로 넘기고, 결과를 표준 `result.json` 형식으로 다시 받아 동일 화면에서 비교한다. 모든 작업은 **작업 플러그인 인터페이스**(분류만 v0 구현, 검출/회귀/이상은 동일 슬롯으로 확장)를 통해 일관된 흐름으로 제공한다.

## Technical Context

**Language/Version**: TypeScript 5.x (Node 20 LTS 빌드)

**Primary Dependencies**:
- 프레임워크/UI: Next.js(App Router) + React, Tailwind CSS, **shadcn/ui**(컴포넌트·차트)
- 브라우저 ML: **TensorFlow.js**(`@tensorflow/tfjs`, WebGL/WebGPU 백엔드) + 사전학습 백본(MobileNetV2 등)
- 로컬 저장: **Dexie**(IndexedDB 래퍼) — 프로젝트·이미지·라벨·결과
- 차트/시각화: shadcn 차트(Recharts 기반) — 학습곡선·혼동행렬
- 노트북 생성: 프로그램적 `.ipynb`(JSON) 생성 (마켓플레이스 스킬 없음 → 직접 구현)
- (P3) 천문 입력: `fitsjs`/wasm FITS 디코더 + 전처리(배경 제거·stretch)

**Storage**: v0 = **브라우저 로컬(IndexedDB/Dexie)**, 백엔드/DB 없음. (이후 단계 = Supabase, P2+)

**Testing**: Vitest + React Testing Library(단위/플러그인 인터페이스), Playwright(6화면 e2e 핵심 동선)

**Target Platform**: 최신 데스크톱·모바일 브라우저. 정적/SSR 호스팅(Vercel 무료 티어). 1차 로드 후 오프라인 동작 지향(PWA 선택).

**Project Type**: Web application (프론트엔드 단일 앱, v0 무백엔드)

**Performance Goals**: 핵심 동선(프로젝트→예측) ≤ 15분(브라우저 학습 포함, SC-001); 라벨링 갤러리 부드러운 스크롤; 학습 중 에폭별 지표 라이브 갱신.

**Constraints**: 코드 0줄·설치 0(SC-004), 사용자 비용 0원(SC-005), v0 무백엔드, 브라우저 학습 상한 ~1,500장(SC-009), 데이터 브라우저 로컬 보존(SC-010), UI 한국어(FR-031).

**Scale/Scope**: 프로젝트당 ~1,500장(브라우저 경로); v0 화면 ~6개, 활성 작업 1종(분류).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

이 레포에는 아직 프로젝트 헌법(`.specify/memory/constitution.md`)이 없다(다른 프로젝트의 헌법은 의도적으로 복사하지 않음). 따라서 정식 게이트는 없으며, 아래 **기본 엔지니어링 원칙**을 자율 게이트로 적용한다:

- **단순성 우선**: v0는 무백엔드(로컬 저장)로 시작 — 불필요한 서버/DB 도입 금지. ✅ 충족(IndexedDB).
- **테스트 가능성**: 모든 FR이 수용 시나리오/SC로 검증 가능. ✅
- **점진적 확장**: 작업 추상화로 검출/회귀/이상까지 코어 변경 없이 확장(SC-007). ✅
- **무료·접근성**: 운영비 0, 코드/설치 0. ✅

> 권장: 본격 개발 전 `/speckit-constitution`으로 정식 헌법을 1회 수립. (게이트 실패 아님)

**Gate 결과: PASS** (미해결 NEEDS CLARIFICATION 없음 — clarify 완료).

## 외부 리소스 바인딩 (Skills.sh / GetDesign.md)

> 사용자 지시에 따라, 구현 시 참조할 외부 마켓플레이스 스킬과 UI 디자인 테마를 계획에 바인딩한다. 각 항목은 "설치하여 기능을 구현할 때 참조하여 구현한다"는 원칙으로 사용한다.

### A. 기능·스킬 스택 (https://www.skills.sh / https://claudemarketplaces.com)

| 영역 | 스킬 | 설치 경로 | 사용 설명 |
|------|------|-----------|-----------|
| Next.js | **next-best-practices** | `npx skillsadd vercel-labs/next-skills` | Next.js(App Router) 모범사례 스킬이다. 설치하여 앱 라우팅·렌더링·정적배포 구조를 구현할 때 참조하여 구현한다. |
| React | **vercel-react-best-practices** | `npx skillsadd vercel-labs/agent-skills` | React 컴포넌트·성능 패턴 스킬이다. 설치하여 라벨링 갤러리·실시간 학습 차트 등 상호작용 컴포넌트를 구현할 때 참조하여 구현한다. |
| 프론트엔드 디자인 | **frontend-design** | `npx skillsadd anthropics/skills` | 프론트엔드 디자인 패턴 스킬이다. 설치하여 6화면 흐름의 레이아웃·상태(빈/로딩/오류)·접근성을 구현할 때 참조하여 구현한다. |
| UI 컴포넌트·차트 | **shadcn** | `npx skillsadd shadcn/ui` | shadcn/ui 컴포넌트·차트 스킬이다. 설치하여 공통 컴포넌트 시스템과 학습곡선·혼동행렬 차트를 구현할 때 참조하여 구현한다. |
| 백엔드/DB (이후 단계) | **supabase** | `npx skillsadd supabase/agent-skills` | Supabase 백엔드 스킬이다. **v0에는 불필요**하나, P2+ 클라우드 저장·계정·공유 도입 시 설치하여 참조하여 구현한다. |

**마켓플레이스 미커버 영역(직접 구현 + 공식 문서 참조)** — 정직하게 명시한다:
- **브라우저 ML(TensorFlow.js 전이학습)**: 대응 스킬 없음 → TF.js 공식 가이드를 참조해 직접 구현(`lib/ml/`).
- **노트북(.ipynb) 자동 생성**: 대응 스킬 없음 → nbformat 스펙에 맞춰 JSON을 직접 생성(`lib/notebook/`).
- **FITS/천문 전처리(P3)**: 대응 스킬 없음 → `fitsjs`/wasm + astropy 관례를 참조해 직접 구현(`lib/astro/`).
- 보완 검색: https://claudemarketplaces.com 에서 알림/모니터링/스토리지 MCP가 필요해지면(P2+) 추가 바인딩.

### B. UI/UX 디자인 테마 (https://getdesign.md)

전체 시스템은 **단일 디자인 토큰 체계**(`lib/design/tokens`)를 공유하고, 모든 표면이 동일 토큰을 참조하도록 강제한다. 컴포넌트는 shadcn/ui 단일 라이브러리에서 파생해 중복 구현을 막는다.

**1) 연구 워크벤치(핵심 작업 화면) — Linear 테마**
```bash
npx getdesign@latest add linear
```
- 프리뷰/복사: https://getdesign.md/linear.app/design-md (ultra-minimal, precise, purple accent, **다크 친화**).
- 적용 지침: 라벨링·학습·결과 화면은 데이터 밀도가 높으므로 Linear의 정밀·미니멀 패턴(타이트한 간격, 절제된 강조색, 키보드 우선)으로 구성한다. **천문 이미지 뷰어는 다크 캔버스**를 기본으로 하여 천체 이미지 대비를 살린다(아래 천문 검증 참조).

**2) 온보딩·빈 상태·안내(비전공 학생 진입) — Notion 테마**
```bash
npx getdesign@latest add notion
```
- 프리뷰/복사: https://getdesign.md/notion/design-md (warm minimalism, soft surfaces).
- 적용 지침: 첫 프로젝트 생성·데모 불러오기·도움말 등 **비전공자 진입 표면**은 Notion의 따뜻하고 부담 없는 톤으로 구성해 "ML 몰라도 됨"을 느끼게 한다.

**일관성 규칙**: 두 테마의 **공통 토큰(색 스케일·타이포·간격·라운드·상태색)** 을 단일 소스로 정의하고, 워크벤치/온보딩 표면은 같은 토큰의 테마 변형으로만 분기한다. 다크/라이트 모드 토글 제공(천문 뷰어는 항상 다크 우선).

**대안 테마(참고)**: Vercel(`add vercel`, 흑백 정밀·Geist), IBM(`add ibm`, 구조적 블루·데이터밀도), Apple(`add apple`, 프리미엄 여백). 브랜드 방향 변경 시 교체 후보.

## 천문/우주과학 연구 실효성 검증 (단계별)

> 사용자 지시: 모든 단계에서 천문 연구에 실질 도움이 되는지 검증한다.

| 결정/단계 | 천문 연구 실효성 | 검증 근거 |
|---|---|---|
| 작업=**분류**(v0) | 은하 형태분류·항성/은하 분리 등 천문에서 가장 흔한 첫 ML 과제 | Galaxy Zoo류 실제 연구 과제와 일치 |
| **전이학습**(백본 고정) | 소규모 라벨로도 baseline 확보 — 학생 연구의 현실(라벨 부족)에 부합 | 천문 ML에서 전이학습은 표준 베이스라인 |
| **브라우저 즉시 학습** | 설치·환경구성 장벽 제거 → 천문 전공이 ML 환경설정에 시간 안 뺏김 | H1(≤15분 완주) |
| **노트북 핸드오프** | 진짜 GPU로 논문급 재현·확장 가능, 무료 | astropy/PyTorch 생태계로 자연 연결 |
| **다크 이미지 뷰어** | 천체 이미지는 다크 배경·과학 컬러맵에서 구조가 잘 보임(DS9/Aladin 관례) | 관측천문 표준 뷰잉 |
| **FITS/WCS·전처리**(P3) | 천문 표준 포맷·좌표·배경제거가 있어야 실제 관측 데이터에 적용 가능 | 범용 ML 툴 대비 결정적 차별 |
| **회귀(photo-z 등)**(P4) | 측광 적색편이 추정은 대표적 천문 회귀 문제 | SDSS spec-z 검증 데이터 존재 |
| **재현성 리포트**(P5) | 분할·설정·데이터 식별 기록은 논문 재현성 요건 | 연구 신뢰성 |

## Project Structure

### Documentation (this feature)

```text
specs/001-astroml-studio/
├── plan.md              # 본 파일
├── research.md          # Phase 0 — 기술 결정 근거
├── data-model.md        # Phase 1 — v0 로컬 데이터 모델
├── quickstart.md        # Phase 1 — 검증 시나리오
├── contracts/           # Phase 1 — 인터페이스 계약
│   ├── task-plugin.md       # 작업 플러그인 인터페이스
│   ├── result-schema.json   # 표준 결과(브라우저/노트북 공용)
│   ├── local-store.md       # IndexedDB 스토어 계약
│   └── notebook-handoff.md  # 노트북 입력/출력 계약
└── tasks.md             # Phase 2 (/speckit-tasks 에서 생성)
```

### Source Code (repository root)

```text
astroml-studio/
├── app/                       # Next.js App Router (화면 = 6단계 흐름)
│   ├── page.tsx               # 홈/프로젝트 목록
│   ├── new/                   # 1) 새 프로젝트(작업 선택·클래스 정의)
│   └── project/[id]/
│       ├── data/              # 2) 데이터(데모 불러오기/업로드)
│       ├── label/             # 3) 라벨링
│       ├── train/             # 4) 학습(브라우저)
│       ├── result/            # 5) 결과(혼동행렬·곡선·오분류)
│       └── predict/           # 6) 예측/내보내기
├── components/                # shadcn/ui 파생 + 도메인 컴포넌트
│   ├── ui/                    # shadcn 기본
│   ├── gallery/               # 라벨링 갤러리
│   ├── charts/                # 학습곡선·혼동행렬
│   └── viewer/                # (다크) 이미지 뷰어
├── lib/
│   ├── tasks/                 # 작업 플러그인 시스템
│   │   ├── types.ts           # TaskPlugin 인터페이스(7 슬롯)
│   │   └── classification/    # v0 구현(검출/회귀/이상은 빈 슬롯)
│   ├── ml/                    # TF.js 전이학습(임베딩+헤드), 평가
│   ├── store/                 # Dexie(IndexedDB) 로컬 저장
│   ├── notebook/              # .ipynb 생성기
│   ├── astro/                 # (P3) FITS/WCS·전처리
│   └── design/                # 디자인 토큰(단일 소스)
├── public/demo/               # 데모 데이터(은하 3클래스 서브셋)
└── tests/
    ├── unit/                  # 플러그인·ML·store 단위
    └── e2e/                   # 6화면 핵심 동선(Playwright)
```

**Structure Decision**: 단일 Next.js 프론트엔드 앱(무백엔드). 핵심 분리축은 `app/`(화면)과 `lib/`(작업 플러그인·ML·로컬저장·노트북·천문). 작업 추상화(`lib/tasks`)를 코어로 두어 향후 작업 확장이 코어 변경 없이 빈 슬롯 채우기로 이뤄지게 한다(SC-007).

## Complexity Tracking

> Constitution 위반 없음 — 작성 불필요.
