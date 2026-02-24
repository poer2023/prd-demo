"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { ProjectCard, AddProjectCard } from "@/components/ProjectCard";
import { getPublicProjects, getAllProjects, type Project } from "@/config/projects";

export default function HomePage() {
  const [isLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("protodoc_logged_in") === "true";
  });
  const [projects] = useState<Project[]>(() => {
    if (typeof window === "undefined") return getPublicProjects();
    const loggedIn = localStorage.getItem("protodoc_logged_in") === "true";
    return loggedIn ? getAllProjects() : getPublicProjects();
  });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header - 与内容区域宽度一致 */}
      <header className="h-14 border-b border-[var(--border-color)] bg-[var(--background)]">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[var(--foreground)] rounded-md flex items-center justify-center">
              <span className="text-[var(--background)] font-semibold text-xs">P</span>
            </div>
            <span className="font-medium text-[var(--foreground)]">ProtoDoc</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-medium text-[var(--foreground)] mb-6">
            选择一个项目开始工作
          </h1>

          {/* 搜索框 */}
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索项目..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 项目卡片网格 - 3列 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoggedIn && <AddProjectCard />}
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <span>© 2025 ProtoDoc</span>
          <div className="flex items-center gap-6">
            <Link href="/settings" className="hover:text-[var(--foreground)] transition">
              设置
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--foreground)] transition"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
