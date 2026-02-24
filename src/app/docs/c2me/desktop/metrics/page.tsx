"use client";

import { DocLayout } from "@/components/layout";
import { c2meNavTree } from "@/config/docs";
import { DesktopMetricsPrototype } from "@/components/prototypes";

export default function MetricsPage() {
  return (
    <DocLayout
      title="指标面板"
      description="实时监控消息统计、API 调用、系统资源等指标。"
      versions={[{ id: "v1", label: "V1", date: "2025-01-19" }]}
      defaultVersion="v1"
      states={[{ id: "default", label: "实时监控" }]}
      defaultState="default"
      decisions={[{ date: "01-17", content: "指标每秒自动刷新" }]}
      navItems={c2meNavTree}
      projectSlug="c2me"
      lastUpdated="2025-01-19"
    >
      {() => <DesktopMetricsPrototype />}
    </DocLayout>
  );
}
