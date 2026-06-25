// LocalStore API (contracts/local-store.md). 무백엔드 — 모든 데이터는 브라우저 로컬.
import { db, type Project, type ImageItem, type Label, type Run, type Result } from "./db";
import { uuid } from "@/lib/utils";
import type { LabelValue, TaskKind } from "@/lib/tasks/types";
import { validateResult, matchesProject, type ResultMetrics } from "@/lib/ml/result-schema";

const SUPPORTED = ["image/png", "image/jpeg", "image/webp"];

async function readImageSize(blob: Blob): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("이미지 디코드 실패"));
      i.src = url;
    });
    return { width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function makeThumb(blob: Blob, max = 160): Promise<Blob> {
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("thumb"));
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
    return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.8));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const store = {
  // ---- Project ----
  async createProject(input: { title: string; taskKind: TaskKind; classes: string[] }): Promise<Project> {
    const now = Date.now();
    const p: Project = {
      id: uuid(),
      title: input.title,
      taskKind: input.taskKind,
      config: { classes: input.classes, split: 0.8, backbone: "mobilenet_v2" },
      createdAt: now,
      updatedAt: now,
    };
    await db.projects.add(p);
    return p;
  },
  getProject: (id: string) => db.projects.get(id),
  listProjects: () => db.projects.orderBy("updatedAt").reverse().toArray(),
  async updateProject(id: string, patch: Partial<Project>) {
    await db.projects.update(id, { ...patch, updatedAt: Date.now() });
  },
  async deleteProject(id: string) {
    await db.transaction("rw", db.projects, db.images, db.labels, db.runs, db.results, async () => {
      await db.images.where("projectId").equals(id).delete();
      await db.labels.where("projectId").equals(id).delete();
      await db.runs.where("projectId").equals(id).delete();
      await db.results.where("projectId").equals(id).delete();
      await db.projects.delete(id);
    });
  },

  // ---- Images (대량 업로드, 손상 항목 스킵+사유) FR-006 ----
  async addImages(
    projectId: string,
    files: Array<{ blob: Blob; name: string; folderClass?: string; meta?: Record<string, unknown> }>,
    source: ImageItem["source"]
  ): Promise<{ added: number; skipped: { name: string; reason: string }[] }> {
    const project = await db.projects.get(projectId);
    const skipped: { name: string; reason: string }[] = [];
    let added = 0;
    for (const f of files) {
      try {
        if (!SUPPORTED.includes(f.blob.type)) {
          skipped.push({ name: f.name, reason: "지원하지 않는 형식" });
          continue;
        }
        const { width, height } = await readImageSize(f.blob);
        const thumb = await makeThumb(f.blob);
        const img: ImageItem = {
          id: uuid(),
          projectId,
          blob: f.blob,
          thumb,
          width,
          height,
          source,
          name: f.name,
          meta: f.meta,
        };
        await db.images.add(img);
        added++;
        // 폴더명=클래스 자동 라벨 (FR-005)
        if (f.folderClass && project && project.config.classes.includes(f.folderClass)) {
          await this.setLabel(img.id, { kind: "classification", class: f.folderClass }, "folder");
        }
      } catch (e) {
        skipped.push({ name: f.name, reason: e instanceof Error ? e.message : "알 수 없는 오류" });
      }
    }
    return { added, skipped };
  },
  listImages: (projectId: string) => db.images.where("projectId").equals(projectId).toArray(),

  // ---- Labels ----
  async setLabel(imageId: string, value: LabelValue, source: Label["source"] = "manual") {
    const img = await db.images.get(imageId);
    if (!img) throw new Error("이미지 없음");
    const existing = await db.labels.where("imageId").equals(imageId).first();
    const label: Label = {
      id: existing?.id ?? uuid(),
      imageId,
      projectId: img.projectId,
      taskKind: (await db.projects.get(img.projectId))!.taskKind,
      value,
      source,
    };
    await db.labels.put(label);
  },
  listLabels: (projectId: string) => db.labels.where("projectId").equals(projectId).toArray(),
  async labelProgress(projectId: string) {
    const total = await db.images.where("projectId").equals(projectId).count();
    const labeled = await db.labels.where("projectId").equals(projectId).count();
    return { labeled, total };
  },

  // ---- Runs / Results ----
  async createRun(input: Omit<Run, "id" | "createdAt" | "status"> & { status?: Run["status"] }): Promise<Run> {
    const run: Run = { id: uuid(), createdAt: Date.now(), status: input.status ?? "running", ...input };
    await db.runs.add(run);
    return run;
  },
  async updateRun(id: string, patch: Partial<Run>) {
    await db.runs.update(id, patch);
  },
  async saveResult(runId: string, projectId: string, metrics: ResultMetrics, modelUri?: string): Promise<Result> {
    const errs = validateResult(metrics);
    if (errs) throw new Error("결과 형식 오류: " + errs.join(", "));
    const result: Result = { id: uuid(), runId, projectId, metrics, modelUri, createdAt: Date.now() };
    await db.results.add(result);
    return result;
  },
  async listResults(projectId: string): Promise<{ run: Run; result: Result }[]> {
    const results = await db.results.where("projectId").equals(projectId).toArray();
    const out: { run: Run; result: Result }[] = [];
    for (const r of results) {
      const run = await db.runs.get(r.runId);
      if (run) out.push({ run, result: r });
    }
    return out.sort((a, b) => b.result.createdAt - a.result.createdAt);
  },

  // ---- 외부(노트북) 결과 업로드 (FR-017/019) ----
  async importExternalResult(projectId: string, raw: unknown): Promise<Result> {
    const schemaErr = validateResult(raw);
    if (schemaErr) throw new Error("결과 스키마 오류: " + schemaErr.join(", "));
    const metrics = raw as ResultMetrics;
    const project = await db.projects.get(projectId);
    if (!project) throw new Error("프로젝트 없음");
    const mismatch = matchesProject(metrics, { taskKind: project.taskKind, classes: project.config.classes });
    if (mismatch) throw new Error("프로젝트 설정 불일치: " + mismatch.join(", "));
    const run = await this.createRun({
      projectId,
      compute: "external",
      backbone: metrics.backbone ?? "external",
      hyperparams: {},
      status: "done",
    });
    return this.saveResult(run.id, projectId, { ...metrics, trained_with: "external" });
  },

  // ---- 용량 (FR-030) ----
  async estimateUsage() {
    if (navigator.storage?.estimate) {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      return { usage, quota };
    }
    return { usage: 0, quota: 0 };
  },
};

export type Store = typeof store;
