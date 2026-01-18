"use client";

import Link from "next/link";

interface HeaderProps {
  projectName?: string;
}

export function Header({ projectName = "ProtoDoc" }: HeaderProps) {
  return (
    <header className="h-14 border-b border-[var(--border-color)] bg-[var(--background-secondary)] flex items-center justify-between px-6 sticky top-0 z-50">
      {/* 左侧 Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-[var(--foreground)]">{projectName}</span>
        </Link>
      </div>

      {/* 右侧操作 */}
      <div className="flex items-center gap-3">
        <button className="px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--background)] rounded-lg transition flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button className="btn-primary flex items-center gap-1.5 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </header>
  );
}
