# Contract: Local Store (IndexedDB / Dexie)

v0 무백엔드 영속화 계약. 모든 데이터는 브라우저 로컬(SC-010). 코어는 이 스토어 API에만 의존.

## 스토어(테이블)

| 스토어 | 키 | 인덱스 |
|---|---|---|
| `projects` | id | updatedAt |
| `images` | id | projectId, source |
| `labels` | id | projectId, imageId |
| `runs` | id | projectId, status |
| `results` | id | runId |

(필드는 [data-model.md](../data-model.md) 참조)

## API (개념적)

```ts
interface LocalStore {
  // Project
  createProject(input): Promise<Project>
  getProject(id): Promise<Project | undefined>
  listProjects(): Promise<Project[]>
  updateProject(id, patch): Promise<void>
  deleteProject(id): Promise<void>            // cascade: images/labels/runs/results

  // Images (대량 업로드)
  addImages(projectId, files): Promise<{added: number; skipped: {name:string; reason:string}[]}>  // FR-006
  listImages(projectId): Promise<ImageItem[]>

  // Labels
  setLabel(imageId, value): Promise<void>     // 분류 value.class ∈ classes 검증
  labelProgress(projectId): Promise<{labeled:number; total:number}>  // FR-010

  // Runs / Results
  createRun(input): Promise<Run>
  saveResult(runId, metrics, modelBlob?): Promise<Result>  // result-schema 검증
  listResults(projectId): Promise<{run:Run; result:Result}[]>

  // 용량
  estimateUsage(): Promise<{usage:number; quota:number}>   // navigator.storage.estimate, FR-030
}
```

## 계약 규칙

- **S1**: `addImages`는 손상/미지원 항목을 건너뛰고 사유를 반환(전체 실패 금지, FR-006).
- **S2**: `saveResult`는 [result-schema.json](./result-schema.json) 검증 통과 시에만 저장.
- **S3**: 외부 업로드 결과는 프로젝트 설정 일치 검증 후 `createRun(compute='external')`+`saveResult`(FR-019).
- **S4**: `estimateUsage`로 한도 근접 감지 → UI 경고(FR-030).
- **S5**: 모든 쓰기는 트랜잭션. 서버 호출 없음(v0).
