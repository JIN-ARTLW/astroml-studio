"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { store } from "@/lib/store";
import { ko } from "@/lib/i18n/ko";
import { DEMO_CLASSES } from "@/lib/demo/loadDemo";
import { Button, Card, Empty, Loading } from "@/components/ui/states";

export default function HomePage() {
  const router = useRouter();
  const projects = useLiveQuery(() => store.listProjects(), []);

  async function startDemo() {
    const p = await store.createProject({
      title: "예시: 은하 형태분류",
      taskKind: "classification",
      classes: DEMO_CLASSES,
    });
    router.push(`/project/${p.id}/data?demo=1`);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">{ko.tagline}</h1>
        <p className="text-muted">
          천문 이미지를 올리고, 라벨을 붙이고, 브라우저에서 바로 학습하세요. 설치도 코드도 필요 없어요.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={startDemo}>{ko.home.openDemo}</Button>
          <Link href="/new">
            <Button variant="outline">{ko.home.create}</Button>
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">내 프로젝트</h2>
        {projects === undefined ? (
          <Loading />
        ) : projects.length === 0 ? (
          <Empty title={ko.home.empty} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <Link key={p.id} href={`/project/${p.id}/data`}>
                <Card className="transition hover:border-accent">
                  <div className="font-medium">{p.title}</div>
                  <div className="mt-1 text-sm text-muted">
                    {p.taskKind} · {p.config.classes.join(", ")}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
