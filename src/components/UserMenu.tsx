"use client";

import { useState } from "react";

interface UserMenuProps {
  showLoginLink?: boolean;
}

export function UserMenu({ showLoginLink = false }: UserMenuProps) {
  const [isLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("protodoc_logged_in") === "true";
  });
  const [userName] = useState(() => {
    if (typeof window === "undefined") return "User";
    return localStorage.getItem("protodoc_user_name") || "User";
  });
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("protodoc_logged_in");
    localStorage.removeItem("protodoc_user_name");
    window.location.reload();
  };

  if (!isLoggedIn) {
    // 只在特定域名显示登录入口
    if (!showLoginLink) return null;

    return (
      <a
        href="/login"
        className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition"
      >
        登录
      </a>
    );
  }

  const initials = userName.slice(0, 1).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-8 h-8 rounded-full bg-[var(--accent-primary)] text-white text-sm font-medium flex items-center justify-center hover:opacity-90 transition"
      >
        {initials}
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-10 w-48 bg-[var(--background-content)] border border-[var(--border-color)] rounded-lg shadow-lg py-1 z-50">
            <div className="px-4 py-2 border-b border-[var(--border-color)]">
              <p className="text-sm font-medium text-[var(--foreground)]">{userName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--nav-hover)] hover:text-[var(--foreground)]"
            >
              退出登录
            </button>
          </div>
        </>
      )}
    </div>
  );
}
