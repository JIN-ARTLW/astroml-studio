# 데이터 모델 (Supabase)

← [캔버스](../CANVAS.md)

> **v0 저장 결정(스펙 확정):** v0는 **브라우저 로컬 저장**(백엔드 없음). 아래 Supabase 스키마는 클라우드 저장·계정·공유를 도입하는 **이후 단계**의 목표 모델이다. v0에서는 동일한 엔티티 구조를 브라우저 로컬에 보존한다. 근거: [spec.md](../specs/001-astroml-studio/spec.md) Clarifications.

PostgreSQL 기준 초안. v0는 분류만 쓰지만 스키마는 일반형(작업 무관)으로.

## 테이블

### projects
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| owner_id | uuid | auth.users FK (익명 허용 시 null 가능) |
| title | text | |
| task_kind | text | 'classification' \| 'detection' \| … |
| config | jsonb | 클래스 정의, 분할 비율 등 작업별 설정 |
| created_at | timestamptz | |

### images
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK | |
| storage_path | text | Supabase Storage 경로 |
| width / height | int | |
| meta | jsonb | WCS 등 (v1+, FITS) |

### labels
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| image_id | uuid FK | |
| task_kind | text | 검증/일관성용 |
| value | jsonb | 분류=`{"class":"spiral"}`, 검출=`{"boxes":[...]}` 등 |
| source | text | 'manual' \| 'folder' \| 'demo' |

### runs
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK | |
| compute | text | 'browser' \| 'colab' |
| backbone | text | mobilenet_v2 등 |
| hyperparams | jsonb | epochs, lr, split 등 |
| status | text | running \| done \| failed |
| created_at | timestamptz | |

### results
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| run_id | uuid FK | |
| metrics | jsonb | [compute-hybrid.md](compute-hybrid.md)의 metrics.json |
| model_path | text | Storage 내 모델 아티팩트 |

## 정책 메모
- v0는 로그인 없이 로컬/익명 프로젝트 우선 → 나중에 Supabase Auth 연동.
- Storage 버킷: `datasets/`(이미지), `models/`(아티팩트).
- RLS는 Auth 도입 시 owner 기준으로.

관련: [작업 인터페이스](task-interface.md)
