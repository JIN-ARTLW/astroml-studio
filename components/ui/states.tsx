// 빈/로딩/오류 상태 + 기본 버튼/카드 프리미티브 (Foundational T016).
"use client";
import { cn } from "@/lib/utils";
import type { ReactNode, ButtonHTMLAttributes } from "react";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" && "bg-accent text-accent-fg hover:opacity-90",
        variant === "outline" && "border border-border bg-surface hover:bg-elevated",
        variant === "ghost" && "hover:bg-elevated",
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-lg border border-border bg-surface p-5", className)}>{children}</div>;
}

export function Loading({ label = "불러오는 중…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
      {label}
    </div>
  );
}

export function Empty({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
      <p className="text-muted">{title}</p>
      {action}
    </div>
  );
}

export function ErrorBox({ messages }: { messages: string[] }) {
  if (!messages.length) return null;
  return (
    <div className="rounded border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
      <ul className="list-disc pl-4">
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}

export function Banner({ children }: { children: ReactNode }) {
  return (
    <div className="rounded border border-warning/40 bg-warning/10 p-3 text-sm text-warning">{children}</div>
  );
}
