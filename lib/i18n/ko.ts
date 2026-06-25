// v0 UI 언어: 한국어 (FR-031). 영어는 이후 단계.
export const ko = {
  appName: "AstroML Studio",
  tagline: "코드 없이, 천문 이미지로 머신러닝.",
  nav: { home: "홈", newProject: "새 프로젝트" },
  home: {
    empty: "아직 프로젝트가 없어요. 새 프로젝트로 시작해보세요.",
    create: "새 프로젝트 만들기",
    openDemo: "예시(은하 형태분류) 바로 해보기",
  },
  steps: { data: "데이터", label: "라벨링", train: "학습", result: "결과", predict: "예측" },
  newProject: {
    title: "새 프로젝트",
    name: "프로젝트 이름",
    task: "작업 유형",
    classes: "클래스 (쉼표로 구분)",
    create: "만들기",
    comingSoon: "곧 제공",
  },
  data: {
    loadDemo: "데모 불러오기",
    upload: "이미지 업로드",
    uploadFolder: "폴더 업로드(폴더명=클래스)",
    skipped: "건너뜀",
    count: (n: number) => `이미지 ${n}장`,
    scaleWarn: "이 규모는 브라우저 학습 권장 상한(약 1,500장)을 넘어요. 외부 GPU 본격 학습을 권장합니다.",
  },
  label: {
    progress: (a: number, b: number) => `라벨 ${a}/${b}`,
    pickClass: "클래스를 선택하세요 (숫자키 사용 가능)",
    autoLabeled: "데모/폴더 데이터는 자동 라벨됨",
  },
  train: {
    start: "학습 시작",
    backbone: "백본",
    epoch: "에폭",
    accuracy: "정확도",
    loss: "손실",
    running: "학습 중…",
    done: "학습 완료",
    guardNoLabel: "라벨이 없습니다. 먼저 라벨링하세요.",
    guardFew: (c: string, n: number) => `클래스 "${c}"의 표본이 너무 적습니다(${n}장). 권장 최소 10장.`,
  },
  result: {
    valAcc: "검증 정확도",
    confusion: "혼동행렬",
    perClass: "클래스별 지표",
    curves: "학습 곡선",
    misclassified: "오분류 사례",
    exportModel: "모델 내보내기",
    exportCsv: "지표 CSV",
    trainedBrowser: "브라우저 학습",
    trainedExternal: "외부 GPU",
  },
  predict: {
    drop: "예측할 이미지를 올리세요",
    confidence: "신뢰도",
  },
  common: { loading: "불러오는 중…", error: "오류", cancel: "취소", back: "뒤로" },
} as const;

export type I18n = typeof ko;
