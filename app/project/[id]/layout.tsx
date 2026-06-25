"use client";
import { useParams } from "next/navigation";
import { ProjectSteps } from "@/components/ProjectSteps";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const id = String(params.id);
  return (
    <div>
      <ProjectSteps projectId={id} />
      {children}
    </div>
  );
}
