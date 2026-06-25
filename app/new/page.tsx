"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";
import { registry } from "@/lib/tasks/registry";
import { ko } from "@/lib/i18n/ko";
import { Button, Card, ErrorBox } from "@/components/ui/states";
import { cn } from "@/lib/utils";
import type { TaskKind } from "@/lib/tasks/types";

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [taskKind, setTaskKind] = useState<TaskKind>("classification");
  const [classesText, setClassesText] = useState("smooth-round, edge-on-disk, spiral");
  const [errors, setErrors] = useState<string[]>([]);

  const plugins = registry.list();

  async function create() {
    const classes = classesText.split(",").map((s) => s.trim()).filter(Boolean);
    const errs: string[] = [];
    if (!title.trim()) errs.push("프로젝트 이름을 입력하세요.");
    if (classes.length < 2) errs.push("클래스를 2개 이상 입력하세요.");
    if (errs.length) return setErrors(errs);
    const p = await store.createProject({ title: title.trim(), taskKind, classes });
    router.push(`/project/${p.id}/data`);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-xl font-semibold">{ko.newProject.title}</h1>
      <Card className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm text-muted">{ko.newProject.name}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-border bg-bg px-3 py-2"
            placeholder="예: 내 은하 분류"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-muted">{ko.newProject.task}</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {plugins.map((p) => {
              const disabled = p.status !== "active";
              return (
                <button
                  key={p.kind}
                  disabled={disabled}
                  onClick={() => setTaskKind(p.kind)}
                  className={cn(
                    "rounded border px-3 py-2 text-sm transition",
                    taskKind === p.kind && !disabled ? "border-accent bg-accent/10" : "border-border",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  {p.title}
                  {disabled && <div className="text-xs text-muted">{ko.newProject.comingSoon}</div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-muted">{ko.newProject.classes}</label>
          <input
            value={classesText}
            onChange={(e) => setClassesText(e.target.value)}
            className="w-full rounded border border-border bg-bg px-3 py-2"
          />
        </div>

        <ErrorBox messages={errors} />
        <Button onClick={create}>{ko.newProject.create}</Button>
      </Card>
    </div>
  );
}
