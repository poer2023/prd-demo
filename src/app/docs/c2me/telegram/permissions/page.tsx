"use client";

import { DocLayout } from "@/components/layout";
import { c2meNavTree } from "@/config/docs";
import { TelegramPermissionsPrototype } from "@/components/prototypes";

export default function PermissionsPage() {
  return (
    <DocLayout
      title="权限系统"
      description="灵活的工具使用审批机制，支持 Default、Accept Edits、Plan、Bypass 四种模式。"
      versions={[{ id: "v1", label: "V1", date: "2025-01-19" }]}
      defaultVersion="v1"
      states={[{ id: "default", label: "交互演示" }]}
      defaultState="default"
      decisions={[
        { date: "01-17", content: "权限请求清晰显示工具类型和参数" },
        { date: "01-16", content: "超时未响应自动拒绝（60秒）" },
      ]}
      navItems={c2meNavTree}
      projectSlug="c2me"
      lastUpdated="2025-01-19"
    >
      {() => <TelegramPermissionsPrototype />}
    </DocLayout>
  );
}
