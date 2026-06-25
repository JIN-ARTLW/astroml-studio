"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ko } from "@/lib/i18n/ko";
import { Button } from "@/components/ui/states";

export function Header() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="border-b border-border bg-surface/60 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-accent">✦</span> {ko.appName}
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/new">
            <Button variant="outline">{ko.nav.newProject}</Button>
          </Link>
          <Button variant="ghost" onClick={() => setDark((d) => !d)} aria-label="테마 전환">
            {dark ? "☀︎" : "☾"}
          </Button>
        </div>
      </div>
    </header>
  );
}
