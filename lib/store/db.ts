// IndexedDB 스키마 (Dexie). data-model.md / contracts/local-store.md.
import Dexie, { type Table } from "dexie";
import type { TaskKind, LabelValue } from "@/lib/tasks/types";
import type { ResultMetrics } from "@/lib/ml/result-schema";

export interface Project {
  id: string;
  title: string;
  taskKind: TaskKind;
  config: { classes: string[]; split?: number; backbone?: string };
  createdAt: number;
  updatedAt: number;
}

export interface ImageItem {
  id: string;
  projectId: string;
  blob: Blob;
  thumb?: Blob;
  width: number;
  height: number;
  meta?: Record<string, unknown>; // 아카이브 출처(ra/dec/survey/url 등) 또는 WCS(P3)
  source: "demo" | "upload" | "folder" | "archive";
  name: string;
}

export interface Label {
  id: string;
  imageId: string;
  projectId: string;
  taskKind: TaskKind;
  value: LabelValue;
  source: "manual" | "folder" | "demo";
}

export interface Run {
  id: string;
  projectId: string;
  compute: "browser" | "external";
  backbone: string;
  hyperparams: Record<string, number>;
  status: "running" | "done" | "failed";
  createdAt: number;
}

export interface Result {
  id: string;
  runId: string;
  projectId: string;
  metrics: ResultMetrics;
  modelUri?: string; // TF.js 모델 저장 주소(indexeddb://...)
  createdAt: number;
}

export class AstroDB extends Dexie {
  projects!: Table<Project, string>;
  images!: Table<ImageItem, string>;
  labels!: Table<Label, string>;
  runs!: Table<Run, string>;
  results!: Table<Result, string>;

  constructor() {
    super("astroml-studio");
    this.version(1).stores({
      projects: "id, updatedAt",
      images: "id, projectId, source",
      labels: "id, projectId, imageId",
      runs: "id, projectId, status",
      results: "id, runId, projectId",
    });
  }
}

export const db = typeof window !== "undefined" ? new AstroDB() : (undefined as unknown as AstroDB);
