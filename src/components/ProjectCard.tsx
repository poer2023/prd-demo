import Link from "next/link";
import type { Project } from "@/config/projects";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/workspace/${project.slug}`}
      className="group flex flex-col justify-between p-5 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] hover:border-gray-300 dark:hover:border-gray-600 transition-all min-h-[140px]"
    >
      <div>
        <h3 className="font-medium text-[var(--foreground)] mb-2">
          {project.name}
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
          {project.description}
        </p>
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-[var(--muted-foreground)]">
          {project.updatedAt}
        </span>
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </Link>
  );
}

export function AddProjectCard() {
  return (
    <div
      className="group flex flex-col justify-between p-5 rounded-xl border border-[var(--border-color)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 min-h-[140px] cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all"
    >
      <div>
        <svg className="w-5 h-5 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
        <span className="font-medium text-[var(--foreground)]">新建项目</span>
      </div>
      <div className="flex justify-end">
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </div>
  );
}
