import Link from "next/link";
import type { Project } from "@/config/projects";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/docs/${project.slug}`}
      className="group block p-5 rounded-xl border border-[var(--border-color)] bg-[var(--background-content)] hover:border-[#d1d5db] transition-all"
    >
      <div
        className="h-2 w-12 rounded-full mb-4"
        style={{ backgroundColor: project.color || "#e5e7eb" }}
      />
      <h3 className="font-medium text-[var(--foreground)] mb-1 group-hover:text-[var(--accent-primary)] transition">
        {project.name}
      </h3>
      <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4">
        {project.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-secondary)]">
          {project.updatedAt}
        </span>
        <svg
          className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-1 transition-all"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

export function AddProjectCard() {
  return (
    <div
      className="flex flex-col justify-between p-5 rounded-xl border border-dashed border-[var(--border-color)] bg-gradient-to-br from-[#e0e7ff] to-[#c7d2fe] min-h-[160px] cursor-pointer hover:border-[var(--accent-primary)] transition"
    >
      <div>
        <svg className="w-6 h-6 text-[var(--text-muted)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
        <span className="font-medium text-[var(--foreground)]">Add project</span>
      </div>
      <svg
        className="w-4 h-4 text-[var(--text-secondary)] self-end"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
