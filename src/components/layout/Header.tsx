"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { ViewSwitcher } from "@/components/layout/ViewSwitcher";

interface HeaderProps {
  projectName?: string;
  showProjectName?: boolean;
  showLoginLink?: boolean;
  showViewSwitcher?: boolean;
}

export function Header({
  projectName = "ProtoDoc",
  showProjectName = true,
  showLoginLink = false,
  showViewSwitcher = false,
}: HeaderProps) {
  return (
    <header className="h-14 border-b border-[var(--border-color)] bg-[var(--background)] flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[var(--foreground)] rounded-md flex items-center justify-center">
            <span className="text-[var(--background)] font-semibold text-xs">P</span>
          </div>
          {showProjectName && (
            <span className="font-medium text-[var(--foreground)]">{projectName}</span>
          )}
        </Link>
      </div>

      {/* 中央视图切换器 */}
      {showViewSwitcher && (
        <div className="absolute left-1/2 -translate-x-1/2">
          <ViewSwitcher />
        </div>
      )}

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu showLoginLink={showLoginLink} />
      </div>
    </header>
  );
}
