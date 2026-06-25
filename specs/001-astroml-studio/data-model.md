# Data Model: AstroML Studio v0 (브라우저 로컬)

v0는 **IndexedDB(Dexie)** 에 저장한다. 서버 DB 없음. 엔티티 구조는 일반형(작업 무관)으로, 이후 단계의 클라우드 스키마([docs/data-model.md](../../docs/data-model.md))와 1:1 대응.

## 엔티티 & 스토어

### Project
| 필드 | 타입 | 제약/설명 |
|---|---|---|
| id | string(uuid) | PK |
| title | string | 필수 |
| taskKind | enum | `classification`(v0) \| detection \| segmentation \| regression \| anomaly |
| config | object | 클래스 정의(`classes: string[]`), 분할비율(기본 0.8), 백본 등 |
| createdAt | number(ms) | |
| updatedAt | number(ms) | |

**검증**: `taskKind=classification`이면 `config.classes.length ≥ 2`.

### ImageItem
| 필드 | 타입 | 제약/설명 |
|---|---|---|
| id | string | PK |
| projectId | string | FK→Project |
| blob | Blob | 원본 이미지(PNG/JPG). (P3: FITS는 디코딩된 표현 + 원본) |
| thumb | Blob | 썸네일(갤러리용) |
| width/height | number | |
| meta | object? | (P3) WCS 등 천문 메타 |
| source | enum | `demo` \| `upload` \| `folder` |

**검증**: 지원 포맷만 저장; 손상 항목은 저장 거부 + 사유 기록(FR-006).

### Label
| 필드 | 타입 | 제약/설명 |
|---|---|---|
| id | string | PK |
| imageId | string | FK→ImageItem (1:1 권장, 작업따라 다대) |
| projectId | string | FK (쿼리 편의) |
| taskKind | enum | 일관성 검증용 |
| value | object | 작업별: 분류=`{class:string}`, 검출=`{boxes:[...]}`, 세그=`{mask:...}`, 회귀=`{value:number}`, 이상=`{label:'normal'\|'anomaly'}` |
| source | enum | `manual` \| `folder` \| `demo` |

**검증**: 분류 `value.class ∈ config.classes`.

### Run
| 필드 | 타입 | 제약/설명 |
|---|---|---|
| id | string | PK |
| projectId | string | FK |
| compute | enum | `browser` \| `external`(노트북) |
| backbone | string | 예: `mobilenet_v2`(브라우저) / `efficientnet_b0`(노트북) |
| hyperparams | object | epochs, lr, split, seed |
| status | enum | `running` \| `done` \| `failed` |
| createdAt | number | |

### Result
| 필드 | 타입 | 제약/설명 |
|---|---|---|
| id | string | PK |
| runId | string | FK→Run |
| metrics | object | [result-schema.json](./contracts/result-schema.json) 준수 |
| modelBlob | Blob? | 브라우저: TF.js 모델(주소화), 외부: 업로드된 아티팩트 |
| createdAt | number | |

## 관계

```
Project 1─* ImageItem 1─* Label
Project 1─* Run 1─1 Result
```

## 상태 전이 (Run)

```
running ──success──▶ done
   └─────fail──────▶ failed
```

## 라이프사이클 / 보존

- 모든 레코드는 **사용자 브라우저에 보존**(재방문 유지, SC-010). 서버 전송 없음.
- 저장 용량 한도 근접 시 안내·정리/내보내기 유도(FR-030).
- 외부(노트북) 결과 업로드 시 `Project.config`(클래스 수 등)와 **불일치하면 거부**(FR-019).

## 외부 결과 업로드 검증 규칙

1. `metrics.task === Project.taskKind`
2. `metrics.classes` ⊆ / == `Project.config.classes`
3. 스키마 유효성([result-schema.json](./contracts/result-schema.json)) → 통과 시 Run(compute=external)+Result 생성.
