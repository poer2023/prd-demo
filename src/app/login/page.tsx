"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 简单的账号配置（生产环境应使用环境变量）
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "protodoc123",
  name: "王浩",
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem("protodoc_logged_in", "true");
      localStorage.setItem("protodoc_user_name", ADMIN_CREDENTIALS.name);
      router.push("/");
    } else {
      setError("用户名或密码错误");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-full max-w-sm p-8 bg-[var(--background-content)] rounded-xl border border-[var(--border-color)]">
        <h1 className="text-xl font-semibold text-center text-[var(--foreground)] mb-6">
          ProtoDoc 登录
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90 transition"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  );
}
