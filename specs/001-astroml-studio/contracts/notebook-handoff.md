# Contract: Notebook Handoff (외부 GPU 본격 학습)

브라우저 빠른 경로와 외부 GPU 본격 경로를 잇는 계약(P2, FR-016~019).

## 생성: 사이트 → 노트북(.ipynb)

`notebookTemplate(project)`가 nbformat v4 JSON을 생성. 주입 항목:

| 주입 | 내용 |
|---|---|
| 클래스 | `project.config.classes` |
| 데이터 참조 | (a) 사용자 zip 업로드 셀, 또는 (b) 공개 URL 로드 |
| 작업/헤드/손실/지표 | task-plugin 슬롯 값 |
| 백본 | 기본 `efficientnet_b0`(노트북) |
| 출력 규약 | **`result.json`을 result-schema로 출력 + 모델 저장** |

노트북 구조(분류):
1. 환경 설정 → 2. 데이터 로드/분할(seed) → 3. 백본 파인튜닝 → 4. 평가 → 5. **`result.json` 출력 + 모델 저장**.

제공 방식: `.ipynb` 다운로드 + (선택) Gist 업로드→**Open in Colab** 링크.

## 반입: 노트북 결과 → 사이트

사용자가 업로드: `result.json`(+ 선택 모델 아티팩트).

검증(거부 조건, FR-019):
1. `result.json`이 [result-schema.json](./result-schema.json) 만족.
2. `task === project.taskKind`.
3. `classes`가 `project.config.classes`와 일치.

통과 시 `Run(compute='external')` + `Result` 생성 → 결과 화면이 브라우저 결과와 **동일 형식으로 비교 렌더**(FR-018, SC-006).

## 계약 규칙

- **N1**: 생성 노트북은 추가 편집 없이 그대로 실행 가능해야 함(FR-016).
- **N2**: 노트북과 브라우저는 **동일 result-schema**를 출력(단일 진실 형식).
- **N3**: 데이터 전송은 사용자 주도(zip/URL) — 사이트는 사용자 데이터를 서버 보관하지 않음(무백엔드 원칙).
- **N4**: `split.seed`를 노트북에 고정 주입해 재현성 확보(P5 연결).
