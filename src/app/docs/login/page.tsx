"use client";

import { DocLayout } from "@/components/layout";
import { LoginForm } from "@/components/ui";
import { getDocsNavTree } from "@/config/docs";

export default function LoginPage() {
  return (
    <DocLayout
      title="登录功能"
      description="优化登录转化率，将验证码按钮从输入框下方移到输入框内部，减少用户操作路径。"
      versions={[
        { id: "v2", label: "V2 - 验证码内嵌", date: "2024-01-17" },
        { id: "v1", label: "V1 - 验证码在下方", date: "2024-01-10" },
      ]}
      defaultVersion="v2"
      states={[
        { id: "default", label: "默认" },
        { id: "countdown", label: "倒计时" },
        { id: "error", label: "错误提示" },
      ]}
      defaultState="default"
      decisions={[
        { date: "01-17", content: "增加错误状态提示，QA 反馈缺少错误处理" },
        { date: "01-16", content: "倒计时改为 60s，安全团队要求防止短信轰炸" },
        { date: "01-15", content: "选择 V2 方案，用户测试点击率提升 40%" },
        { date: "01-12", content: "完成 V1 方案设计，验证码按钮放在输入框下方" },
        { date: "01-10", content: "启动登录优化项目，目标转化率提升至 75%" },
      ]}
      navItems={getDocsNavTree()}
      lastUpdated="2024-01-18"
    >
      {({ version, state }) => (
        <LoginForm
          variant={version as "v1" | "v2"}
          state={state as "default" | "countdown" | "error"}
          seconds={42}
        />
      )}
    </DocLayout>
  );
}
