// 학습 곡선 + 혼동행렬 (FR-014/020). Recharts 기반.
"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { ResultCurves } from "@/lib/ml/result-schema";
import { cn } from "@/lib/utils";

export function LearningCurves({ curves }: { curves?: ResultCurves }) {
  if (!curves?.train_loss?.length) return null;
  const data = curves.train_loss.map((_, i) => ({
    epoch: i + 1,
    train_acc: curves.train_acc?.[i],
    val_acc: curves.val_acc?.[i],
    train_loss: curves.train_loss?.[i],
    val_loss: curves.val_loss?.[i],
  }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <XAxis dataKey="epoch" stroke="hsl(var(--muted))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted))" fontSize={12} domain={[0, 1]} />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--elevated))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            color: "hsl(var(--fg))",
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="val_acc" name="검증 정확도" stroke="hsl(var(--accent))" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="train_acc" name="학습 정확도" stroke="hsl(var(--success))" dot={false} />
        <Line type="monotone" dataKey="val_loss" name="검증 손실" stroke="hsl(var(--danger))" dot={false} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ConfusionMatrix({ matrix, classes }: { matrix?: number[][]; classes: string[] }) {
  if (!matrix?.length) return null;
  const max = Math.max(1, ...matrix.flat());
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="p-2 text-muted">실제 \ 예측</th>
            {classes.map((c) => (
              <th key={c} className="p-2 text-muted font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, r) => (
            <tr key={r}>
              <td className="p-2 text-muted font-medium">{classes[r]}</td>
              {row.map((v, c) => {
                const intensity = v / max;
                return (
                  <td
                    key={c}
                    className={cn("p-2 text-center tabular-nums", r === c ? "font-semibold" : "")}
                    style={{
                      background: `hsla(var(--accent) / ${intensity * 0.7})`,
                      color: intensity > 0.5 ? "hsl(var(--accent-fg))" : "hsl(var(--fg))",
                    }}
                  >
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
