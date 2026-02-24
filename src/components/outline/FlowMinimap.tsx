"use client";

import { useMemo } from 'react';
import { useOutlineStore } from '@/stores/outlineStore';
import { convertOutlineToSimpleFlow } from '@/lib/outline/outline-to-flow';

interface FlowMinimapProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function FlowMinimap({ isCollapsed = false, onToggleCollapse }: FlowMinimapProps) {
  const { nodes, rootIds, selectedNodeId, selectNode, isFlowLocked, toggleFlowLock } = useOutlineStore();

  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    return convertOutlineToSimpleFlow(nodes, rootIds);
  }, [nodes, rootIds]);

  // 计算节点位置
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const levelNodes: Record<number, string[]> = {};

    // 按层级分组
    flowNodes.forEach((node) => {
      if (!levelNodes[node.level]) {
        levelNodes[node.level] = [];
      }
      levelNodes[node.level].push(node.id);
    });

    // 计算位置
    const width = 200;
    const height = flowNodes.length * 25 + 40;
    const verticalGap = 24;

    let y = 16;
    Object.keys(levelNodes)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((level) => {
        const nodesAtLevel = levelNodes[level];
        const horizontalGap = width / (nodesAtLevel.length + 1);

        nodesAtLevel.forEach((nodeId, index) => {
          positions[nodeId] = {
            x: horizontalGap * (index + 1),
            y,
          };
        });
        y += verticalGap;
      });

    return { positions, height };
  }, [flowNodes]);

  if (isCollapsed) {
    return null;
  }

  return (
    <div className="border-t border-[var(--border-color)] p-3">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          流程缩略图
        </h4>
        <button
          onClick={toggleFlowLock}
          className={`p-1 rounded transition ${
            isFlowLocked
              ? 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
              : 'text-blue-500 bg-blue-50 dark:bg-blue-900/30'
          }`}
          title={isFlowLocked ? '点击解锁编辑' : '点击锁定'}
        >
          {isFlowLocked ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>

      {/* 缩略图 SVG */}
      <div className="bg-[var(--nav-hover)] rounded-lg overflow-hidden">
        <svg
          width="100%"
          height={nodePositions.height}
          viewBox={`0 0 200 ${nodePositions.height}`}
          className="block"
        >
          {/* 绘制边 */}
          {flowEdges.map((edge) => {
            const sourcePos = nodePositions.positions[edge.source];
            const targetPos = nodePositions.positions[edge.target];
            if (!sourcePos || !targetPos) return null;

            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={sourcePos.x}
                y1={sourcePos.y + 4}
                x2={targetPos.x}
                y2={targetPos.y - 4}
                stroke="var(--border-color)"
                strokeWidth={1}
              />
            );
          })}

          {/* 绘制节点 */}
          {flowNodes.map((node) => {
            const pos = nodePositions.positions[node.id];
            if (!pos) return null;

            const isSelected = selectedNodeId === node.id;

            return (
              <g
                key={node.id}
                onClick={() => selectNode(node.id)}
                className="cursor-pointer"
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#3b82f6' : 'var(--text-muted)'}
                  className="transition-all"
                />
                <text
                  x={pos.x + 10}
                  y={pos.y + 3}
                  fontSize={8}
                  fill={isSelected ? '#3b82f6' : 'var(--text-muted)'}
                  className="select-none"
                >
                  {node.label.length > 12 ? node.label.slice(0, 12) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
