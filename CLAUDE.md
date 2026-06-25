# AstroML Studio

천문·우주과학 이미지에서 **머신러닝을 몰라도** 원하는 결과(분류·검출·물리량·이상)를 얻게 해주는 노코드 웹 연구툴. 대상: 천문/물리 학부 고학년 ~ 대학원생.

## Active Feature: 001-astroml-studio

핵심 컨텍스트:
- 연구 캔버스(토대): `CANVAS.md`
- Spec: `specs/001-astroml-studio/spec.md`
- 데이터셋: `docs/datasets.md`
- 작업 플러그인 인터페이스: `docs/task-interface.md`
- v0 사용자 흐름: `docs/v0-flow.md`
- 하이브리드 컴퓨팅: `docs/compute-hybrid.md`
- 데이터 모델: `docs/data-model.md`

## 스코프 원칙

- **v0(P1)**: "분류" 작업 end-to-end + 브라우저 빠른 학습 + 갤럭시 형태 데모.
- 작업 추상화는 처음부터 일반형(검출/회귀/이상까지 감당)으로 설계하되 v0는 분류만 채운다.
- 컴퓨팅은 **하이브리드**: 브라우저 전이학습(즉시) + 외부 무료 GPU 노트북(본격).
- 무료 호스팅 전제. 운영비 ≈ 0.

## 다음 단계

`/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
