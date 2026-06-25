# 하이브리드 컴퓨팅 (브라우저 + Colab)

← [캔버스](../CANVAS.md)

무료로 GPU를 상시 백엔드에 띄우는 건 사실상 불가능 → 두 경로로 우회.

## 경로 A — 브라우저 전이학습 (빠른 경로)

- 라이브러리: **TensorFlow.js**.
- 방식: 사전학습 백본(MobileNetV2) **고정** → 이미지 임베딩 추출 → 작은 Dense 헤드만 학습.
  - 임베딩은 1회만 계산해 캐시 → 에폭 반복이 빠름.
- 장점: 서버비 0, 설치 0, 즉시 결과.
- 한계: 대규모 데이터·풀 파인튜닝 불가, 디바이스 성능 의존.
- 용도: 첫 성공 경험(H1), 데모, 베이스라인.

## 경로 B — Colab 자동 노트북 (본격 경로)

- 사이트가 프로젝트 설정을 읽어 **`.ipynb`를 동적 생성** → "Open in Colab" / 다운로드.
- 노트북 내용(분류 기준):
  1. 데이터 로드(업로드 zip 또는 Supabase Storage URL)
  2. 백본(EfficientNet 등) 파인튜닝
  3. 평가지표 계산
  4. **결과를 표준 JSON으로 출력 + 모델 저장**
- 사용자가 자기 무료 GPU로 실행 → 결과물(모델 + metrics.json) 사이트에 업로드 → 시각화.
- 장점: 진짜 GPU, 무료.
- 한계: 왕복 1회(노트북 실행→업로드) 마찰 → 경로 A로 먼저 가치 제공해 완화(R1).

## 핸드오프 포맷 (두 경로 공용)

같은 데이터셋·라벨·지표를 두 경로가 공유한다.

```jsonc
// metrics.json (경로 A/B 공통 결과 스키마)
{
  "task": "classification",
  "classes": ["smooth-round", "edge-on-disk", "spiral"],
  "metrics": { "accuracy": 0.86, "f1_macro": 0.84 },
  "confusion_matrix": [[..],[..],[..]],
  "per_class": { "spiral": { "precision": 0.82, "recall": 0.88 } },
  "trained_with": "browser" | "colab",
  "backbone": "mobilenet_v2" | "efficientnet_b0"
}
```

→ 사이트 결과뷰는 `trained_with`와 무관하게 같은 JSON을 렌더 → 두 경로 UI 통합.

## 무료 티어 매핑

| 역할 | 서비스 | 비고 |
|---|---|---|
| 프론트 호스팅 | Vercel | Next.js |
| DB/저장/인증 | Supabase | 데이터셋·라벨·결과 |
| 브라우저 학습 | TF.js | 클라이언트 |
| 본격 학습 | Colab/Kaggle | 사용자 계정 GPU |

관련: [작업 인터페이스](task-interface.md) · [데이터 모델](data-model.md)
