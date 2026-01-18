"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ProjectCard, AddProjectCard } from "@/components/ProjectCard";
import { getPublicProjects, getAllProjects, type Project } from "@/config/projects";
import { getSpecList } from "@/lib/specs/store";

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [specCount, setSpecCount] = useState(0);
  const [hasLLMConfig, setHasLLMConfig] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("protodoc_logged_in") === "true";
    setIsLoggedIn(loggedIn);
    setProjects(loggedIn ? getAllProjects() : getPublicProjects());
    setSpecCount(getSpecList().length);
    setHasLLMConfig(!!localStorage.getItem("llm-settings"));
  }, []);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header showProjectName={false} />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
            ProtoDoc
          </h1>
          <p className="text-[var(--muted-foreground)] mb-6">
            混沌思维整理工具 - 从需求到 PRD 到原型
          </p>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            开始工作
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link
            href="/workspace"
            className="p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] hover:border-blue-500 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="font-medium text-[var(--foreground)] group-hover:text-blue-600">工作台</h3>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              PRD 编辑 + AI 助手 + 流程图
            </p>
          </Link>

          <Link
            href="/flow"
            className="p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] hover:border-green-500 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <h3 className="font-medium text-[var(--foreground)] group-hover:text-green-600">流程图</h3>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              AI 生成产品流程图
            </p>
          </Link>

          <Link
            href="/specs"
            className="p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] hover:border-purple-500 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-[var(--foreground)] group-hover:text-purple-600">设计规范</h3>
                {specCount > 0 && (
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-1.5 py-0.5 rounded">
                    {specCount}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              导入 Markdown 设计规范
            </p>
          </Link>
        </div>

        {/* Status Banner */}
        {!hasLLMConfig && (
          <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  请先配置 LLM API 以使用 AI 功能
                </p>
              </div>
              <Link
                href="/settings"
                className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline"
              >
                去设置 →
              </Link>
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-[var(--foreground)] mb-4">项目列表</h2>

          {/* 搜索框 */}
          <div className="max-w-md mb-6">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]"
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
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* 项目卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoggedIn && <AddProjectCard />}
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <span>ProtoDoc v0.4.0</span>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="hover:text-[var(--foreground)]">设置</Link>
            <Link href="/specs" className="hover:text-[var(--foreground)]">规范</Link>
            <Link href="/workspace" className="hover:text-[var(--foreground)]">工作台</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
