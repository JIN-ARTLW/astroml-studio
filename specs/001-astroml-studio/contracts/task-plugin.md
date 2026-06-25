# Contract: Task Plugin Interface

작업 추상화의 단일 계약. v0는 `classification`만 구현, 나머지는 동일 슬롯을 빈 채로 둔다. 코어(`app/`, `lib/ml`, `lib/store`)는 이 인터페이스에만 의존한다.

```ts
type TaskKind = 'classification' | 'detection' | 'segmentation' | 'regression' | 'anomaly'

interface TaskPlugin<TLabel, TPred> {
  kind: TaskKind
  title: string                                   // 한국어 표시명(FR-031)
  status: 'active' | 'coming-soon'                // v0: classification=active, 나머지=coming-soon(FR-001)

  // 1) 입력
  input: { accepts: ('image' | 'fits' | 'meta')[] }   // v0: ['image']

  // 2) 라벨링 UI (React)
  LabelEditor: React.FC<{
    image: ImageRef
    value: TLabel | null
    onChange: (l: TLabel) => void
    classes?: string[]
  }>

  // 3) 출력 헤드
  head: { units: number | 'dynamic'; activation: 'softmax' | 'sigmoid' | 'linear' }

  // 4) 손실
  loss: 'categoricalCrossentropy' | 'binaryCrossentropy' | 'mse'

  // 5) 평가지표
  metrics: MetricSpec[]                            // 분류=['accuracy','f1']

  // 6) 브라우저 학습 (전이학습)
  buildHead(backbone: tf.LayersModel): tf.LayersModel
  evaluate(preds: TPred[], labels: TLabel[]): ResultMetrics  // result-schema 준수

  // 7) 노트북 템플릿 + 결과뷰
  notebookTemplate(project: Project): NotebookSpec   // .ipynb 생성 입력
  ResultView: React.FC<{ result: ResultMetrics }>
}
```

## 계약 규칙

- **C1**: `evaluate()`의 반환은 반드시 [result-schema.json](./result-schema.json)을 만족한다(브라우저/노트북 동일 형식, FR-018).
- **C2**: `status='coming-soon'`인 작업은 프로젝트 생성 UI에 비활성으로 노출(FR-001).
- **C3**: 코어는 특정 작업을 하드코딩하지 않고 레지스트리(`lib/tasks/registry`)에서 plugin을 조회한다.
- **C4**: 새 작업 추가 = 새 `TaskPlugin` 구현 + 레지스트리 등록(코어 변경 0, SC-007 검증 지점).

## v0 classification 구현 값

| 슬롯 | 값 |
|---|---|
| input.accepts | `['image']` |
| LabelEditor | 클래스 버튼(단일선택)+숫자 단축키(FR-009) |
| head | `{units:'dynamic'(=클래스수), activation:'softmax'}` |
| loss | `categoricalCrossentropy` |
| metrics | accuracy, per-class precision/recall, confusion matrix |
| buildHead | MobileNetV2 임베딩→Dense(softmax) |
| notebookTemplate | EfficientNet 파인튜닝(.ipynb) |
| ResultView | 혼동행렬+곡선+오분류 갤러리(FR-020) |
