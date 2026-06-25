# 데모 데이터

기본 동작: `manifest.json`이 없으면 앱이 **합성 예시 3클래스**를 생성한다(파이프라인 검증용 placeholder).

## 실제 데이터로 교체 (천문 연구 실효성 ↑)

권장: **Galaxy10 DECaLS**에서 시각적으로 뚜렷한 3클래스 서브셋을 추출.

1. `smooth-round`, `edge-on-disk`, `spiral` 각 300~500장을 PNG로 추출.
2. 아래 구조로 배치:
   ```
   public/demo/
   ├── manifest.json
   └── images/
       ├── smooth-round/000.png ...
       ├── edge-on-disk/000.png ...
       └── spiral/000.png ...
   ```
3. `manifest.json` 예:
   ```json
   {
     "source": "Galaxy10 DECaLS (astroNN)",
     "classes": ["smooth-round", "edge-on-disk", "spiral"],
     "items": [
       { "path": "images/smooth-round/000.png", "class": "smooth-round" }
     ]
   }
   ```

manifest가 있으면 앱이 자동으로 실데이터를 사용한다(합성 폴백 대신).

> 상세: `docs/datasets.md`
