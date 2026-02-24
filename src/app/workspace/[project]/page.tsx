"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getNavTreeByProject } from "@/config/docs";

interface ProjectPageProps {
  params: Promise<{
    project: string;
  }>;
}

// 获取第一个可用页面的 slug
function getFirstPageSlug(navTree: ReturnType<typeof getNavTreeByProject>): string | null {
  for (const item of navTree) {
    // 如果有子项，返回第一个子项的 slug
    if (item.children && item.children.length > 0) {
      return item.children[0].slug;
    }
    // 否则返回当前项的 slug
    return item.slug;
  }
  return null;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const router = useRouter();
  const { project } = use(params);

  useEffect(() => {
    const navTree = getNavTreeByProject(project);
    const firstPageSlug = getFirstPageSlug(navTree);

    if (firstPageSlug) {
      // 重定向到第一篇文章
      router.replace(`/workspace/${project}/${firstPageSlug}`);
    } else {
      // 如果没有页面，重定向到首页
      router.replace("/");
    }
  }, [project, router]);

  // 显示加载状态
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-[var(--muted-foreground)]">正在加载项目...</p>
      </div>
    </div>
  );
}
