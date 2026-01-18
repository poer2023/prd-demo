"use client";

import { useState, useEffect } from "react";

interface LoginFormProps {
  variant?: "v1" | "v2";
  state?: "default" | "countdown" | "error";
  seconds?: number;
}

export function LoginForm({
  variant = "v1",
  state = "default",
  seconds = 60
}: LoginFormProps) {
  const [countdown, setCountdown] = useState(seconds);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (state === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, state]);

  const isCountingDown = state === "countdown" && countdown > 0;

  if (variant === "v1") {
    // V1: 验证码按钮在输入框下方（旧方案）
    return (
      <div className="w-full max-w-sm mx-auto p-6 border rounded-xl bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
          登录
        </h2>

        <div className="space-y-4">
          <input
            type="tel"
            placeholder="请输入手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="请输入验证码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* V1 问题：按钮在下方，用户不容易发现 */}
          <button
            disabled={isCountingDown}
            className={`w-full py-2 text-sm rounded-lg transition ${
              isCountingDown
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-50 text-blue-600 hover:bg-gray-100"
            }`}
          >
            {isCountingDown ? `${countdown}s 后重新获取` : "获取验证码"}
          </button>

          <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            登录
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          方案 V1 - 验证码按钮在下方
        </p>
      </div>
    );
  }

  // V2: 验证码按钮在输入框内（新方案）
  return (
    <div className="w-full max-w-sm mx-auto p-6 border rounded-xl bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
        登录
      </h2>

      <div className="space-y-4">
        <input
          type="tel"
          placeholder="请输入手机号"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* V2 改进：验证码按钮内嵌在输入框右侧 */}
        <div className="relative">
          <input
            type="text"
            placeholder="请输入验证码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 pr-28 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            disabled={isCountingDown}
            className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm rounded-md transition ${
              isCountingDown
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
          >
            {isCountingDown ? `${countdown}s` : "获取验证码"}
          </button>
        </div>

        {state === "error" && (
          <p className="text-sm text-red-500">验证码错误，请重新输入</p>
        )}

        <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          登录
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        方案 V2 - 验证码按钮内嵌
      </p>
    </div>
  );
}
