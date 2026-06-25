// 사전학습 백본(MobileNetV2) 로드 + 임베딩 추출 (전이학습 특징추출).
"use client";
import * as tf from "@tensorflow/tfjs";
import * as mobilenetModule from "@tensorflow-models/mobilenet";

let _model: mobilenetModule.MobileNet | null = null;

export async function loadBackbone(): Promise<mobilenetModule.MobileNet> {
  if (_model) return _model;
  await tf.ready();
  _model = await mobilenetModule.load({ version: 2, alpha: 1.0 });
  return _model;
}

async function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("이미지 로드 실패"));
      i.src = url;
    });
  } finally {
    // url은 decode 후 해제. (이미지가 메모리에 로드된 뒤)
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

/** 이미지 Blob → 임베딩 벡터(Float32Array). intermediate=true로 분류 직전 특징을 추출. */
export async function embed(model: mobilenetModule.MobileNet, blob: Blob): Promise<tf.Tensor> {
  const img = await blobToImage(blob);
  return tf.tidy(() => {
    const pixels = tf.browser.fromPixels(img);
    // mobilenet.infer는 내부에서 224 리사이즈/정규화 처리.
    const embedding = model.infer(pixels, true) as tf.Tensor; // [1, embDim]
    return embedding;
  });
}
