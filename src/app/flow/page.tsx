"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { generateFlowFromRequirement } from '@/lib/flow/generator';
import { getActiveSpec } from '@/lib/specs/store';
import type { FlowNode, FlowEdge } from '@/lib/flow/types';
import type { DesignSpec } from '@/lib/specs/types';

// 动态导入 FlowEditor 以避免 SSR 问题
const FlowEditor = dynamic(
  () => import('@/components/flow/FlowEditor').then(mod => mod.FlowEditor),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full">Loading editor...</div> }
);

export default function FlowPage() {
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [requirement, setRequirement] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSpec, setActiveSpec] = useState<DesignSpec | null>(null);

  useEffect(() => {
    const spec = getActiveSpec();
    setActiveSpec(spec);
  }, []);

  const handleGenerate = async () => {
    if (!requirement.trim()) return;

    setGenerating(true);
    setError(null);

    try {
      const result = await generateFlowFromRequirement(requirement, activeSpec);
      setNodes(result.nodes);
      setEdges(result.edges);
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = () => {
    const data = {
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Header projectName="Flow Editor" />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-[var(--border-color)] p-4 flex flex-col gap-4">
          <div>
            <h2 className="font-medium text-[var(--foreground)] mb-2">AI 生成流程图</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-3">
              输入需求描述，AI 将自动生成产品流程图
            </p>

            {activeSpec ? (
              <div className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-2 rounded mb-3">
                使用规范: {activeSpec.name}
              </div>
            ) : (
              <div className="text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 p-2 rounded mb-3">
                未选择设计规范，<a href="/specs" className="underline">去导入</a>
              </div>
            )}

            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="例如：用户登录流程，包含手机验证码登录和密码登录两种方式，登录成功后跳转首页"
              className="w-full h-32 px-3 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-md text-[var(--foreground)] text-sm resize-none"
            />

            {error && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating || !requirement.trim()}
              className="mt-3 w-full btn-primary disabled:opacity-50"
            >
              {generating ? '生成中...' : '🪄 AI 生成'}
            </button>
          </div>

          <div className="border-t border-[var(--border-color)] pt-4">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">流程统计</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-[var(--card-bg)] p-2 rounded">
                <div className="text-[var(--muted-foreground)]">节点</div>
                <div className="font-medium text-[var(--foreground)]">{nodes.length}</div>
              </div>
              <div className="bg-[var(--card-bg)] p-2 rounded">
                <div className="text-[var(--muted-foreground)]">连接</div>
                <div className="font-medium text-[var(--foreground)]">{edges.length}</div>
              </div>
            </div>
          </div>

          {nodes.length > 0 && (
            <button
              onClick={handleExport}
              className="btn-secondary"
            >
              导出 JSON
            </button>
          )}
        </div>

        {/* Flow Editor */}
        <div className="flex-1">
          {nodes.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[var(--muted-foreground)]">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <p>输入需求描述，生成流程图</p>
                <p className="text-sm mt-1">或手动添加节点开始设计</p>
              </div>
            </div>
          ) : (
            <FlowEditor
              initialNodes={nodes}
              initialEdges={edges}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
            />
          )}
        </div>
      </div>
    </div>
  );
}
