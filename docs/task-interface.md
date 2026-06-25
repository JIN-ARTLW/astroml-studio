# 작업 플러그인 인터페이스 (Task Plugin)

← [캔버스](../CANVAS.md)

이 프로젝트에서 **가장 비싼 결정**. v0는 분류만 구현하지만, 인터페이스는 처음부터 일반형으로 설계해 4작업을 감당한다(위험 R2 대응).

## 타입 스케치 (TypeScript)

```ts
type TaskKind =
  | 'classification'
  | 'detection'
  | 'segmentation'
  | 'regression'
  | 'anomaly'

// 라벨/예측은 작업별 제네릭
interface TaskPlugin<TLabel, TPred> {
  kind: TaskKind
  title: string

  // 1) 입력 스키마
  input: {
    accepts: ('image' | 'fits' | 'meta')[]
    // FITS/메타는 v1+, v0는 'image'만
  }

  // 2) 라벨링 UI (React 컴포넌트)
  LabelEditor: React.FC<{
    image: ImageRef
    value: TLabel | null
    onChange: (l: TLabel) => void
    classes?: string[] // 분류용
  }>

  // 3) 출력 헤드 명세 (브라우저 + 노트북 공용)
  head: {
    units: number | 'dynamic'   // 분류=클래스수, 회귀=1
    activation: 'softmax' | 'sigmoid' | 'linear'
  }

  // 4) 손실 + 평가지표
  loss: 'categoricalCrossentropy' | 'mse' | 'binaryCrossentropy'
  metrics: MetricSpec[]   // 예: ['accuracy','f1'] / ['rmse','mae']

  // 5) 브라우저 학습 (전이학습: 백본 고정 + 헤드 학습)
  buildHead(backbone: tf.LayersModel): tf.LayersModel
  evaluate(preds: TPred[], labels: TLabel[]): MetricResult

  // 6) Colab 노트북 생성기 (본격 학습)
  notebookTemplate(project: Project): string  // .ipynb (JSON 문자열)

  // 7) 결과 시각화
  ResultView: React.FC<{ result: RunResult }>
}
```

## v0 구현: classification 플러그인

| 항목 | 값 |
|---|---|
| 입력 | image (PNG/JPG, 256×256로 리사이즈) |
| 라벨 UI | 클래스 버튼(단일선택) + 키보드 단축키 |
| 헤드 | `units = 클래스수`, `softmax` |
| 손실 | categoricalCrossentropy |
| 지표 | accuracy, per-class precision/recall, confusion matrix |
| 브라우저 학습 | MobileNetV2 임베딩(고정) → Dense(softmax) |
| 노트북 | EfficientNet 파인튜닝 템플릿 (PyTorch 또는 TF) |
| 결과뷰 | 혼동행렬 + 오분류 갤러리 + 학습곡선 |

## 다른 작업이 같은 인터페이스에 어떻게 들어오나 (검증용)

| 작업 | LabelEditor | head | loss | metrics |
|---|---|---|---|---|
| detection | 박스 드로잉 | bbox 회귀+분류 | (검출 손실) | mAP |
| segmentation | 마스크 브러시 | per-pixel | dice/CE | IoU |
| regression | 슬라이더/숫자입력 | units=1, linear | mse | RMSE, MAE |
| anomaly | 정상/이상 토글 | sigmoid | binaryCE | AUROC |

→ 7개 슬롯이 작업마다 "빈칸 채우기"로 들어오는지 = H3 검증.
관련: [데이터셋](datasets.md) · [v0 흐름](v0-flow.md) · [하이브리드 컴퓨팅](compute-hybrid.md)
