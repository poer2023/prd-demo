"use client";

import { DocLayout } from "@/components/layout";
import { c2meNavTree } from "@/config/docs";

export default function WorkersPage() {
  return (
    <DocLayout
      title="Cloudflare Workers"
      description="可选的 Cloudflare Workers 集成，提供差异查看和文件托管服务。"
      versions={[{ id: "v1", label: "V1", date: "2025-01-19" }]}
      defaultVersion="v1"
      states={[{ id: "default", label: "默认" }]}
      defaultState="default"
      decisions={[
        { date: "01-15", content: "Diff 查看服务完成" },
        { date: "01-14", content: "API Key 认证完成" },
      ]}
      navItems={c2meNavTree}
      projectSlug="c2me"
      lastUpdated="2025-01-19"
    >
      {() => (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">服务端点</h4>
            <div className="space-y-1 text-sm font-mono">
              <div><span className="text-orange-600">/api/diff</span> - 差异内容查看</div>
              <div><span className="text-orange-600">/api/file</span> - 文件查看服务</div>
              <div><span className="text-orange-600">/diff</span> - HTML 差异渲染</div>
              <div><span className="text-orange-600">/file</span> - HTML 文件渲染</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">部署命令</h4>
            <code className="block p-2 bg-gray-100 dark:bg-gray-900 rounded text-sm">wrangler deploy</code>
          </div>
        </div>
      )}
    </DocLayout>
  );
}
