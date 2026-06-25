"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ko } from "@/lib/i18n/ko";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "data", label: ko.steps.data },
  { key: "label", label: ko.steps.label },
  { key: "train", label: ko.steps.train },
  { key: "result", label: ko.steps.result },
  { key: "predict", label: ko.steps.predict },
];

export function ProjectSteps({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex flex-wrap gap-1 text-sm">
      {STEPS.map((s, i) => {
        const href = `/project/${projectId}/${s.key}`;
        const active = pathname?.endsWith("/" + s.key);
        return (
          <Link
            key={s.key}
            href={href}
            className={cn(
              "rounded px-3 py-1.5 transition",
              active ? "bg-accent text-accent-fg" : "text-muted hover:bg-elevated"
            )}
          >
            <span className="tabular-nums opacity-60">{i + 1}.</span> {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
