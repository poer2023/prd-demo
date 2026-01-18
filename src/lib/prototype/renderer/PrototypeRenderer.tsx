/**
 * 原型渲染器
 * 渲染完整的页面原型
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { PagePrototype, ComponentInteraction, InteractionAction } from '../types';
import { useDesignSystem } from '../design-systems/hooks';
import { ComponentRenderer } from './ComponentRenderer';

interface PrototypeRendererProps {
  prototype: PagePrototype;
  designSystemId?: string;
  isInteractive?: boolean;
  showControls?: boolean;
  className?: string;
}

export function PrototypeRenderer({
  prototype,
  isInteractive = true,
  showControls = false,
  className = '',
}: PrototypeRendererProps) {
  const designSystem = useDesignSystem();
  const [interactionLog, setInteractionLog] = useState<string[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | undefined>();

  // 处理交互动作
  const handleInteraction = useCallback((interaction: ComponentInteraction) => {
    const action = interaction.action;
    let logMessage = '';

    switch (action.type) {
      case 'navigate':
        logMessage = `导航到: ${action.target}`;
        break;
      case 'setState':
        logMessage = `设置状态: ${action.key} = ${JSON.stringify(action.value)}`;
        break;
      case 'showToast':
        logMessage = `显示提示: ${action.message}`;
        break;
      case 'toggleVisible':
        logMessage = `切换可见性: ${action.targetId}`;
        setHighlightedId((prev) =>
          prev === action.targetId ? undefined : action.targetId
        );
        break;
      case 'custom':
        logMessage = `自定义动作: ${action.handler}`;
        break;
    }

    setInteractionLog((prev) => [...prev.slice(-9), logMessage]);
  }, []);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* 原型名称 */}
      {showControls && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {prototype.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({designSystem.name})
            </span>
          </div>
          {isInteractive && (
            <span className="text-xs text-green-600 dark:text-green-400">
              ● 可交互
            </span>
          )}
        </div>
      )}

      {/* 原型内容 */}
      <div className="flex-1 overflow-auto p-6">
        <ComponentRenderer
          component={prototype.rootComponent}
          designSystem={designSystem}
          isInteractive={isInteractive}
          onInteraction={handleInteraction}
          highlightedId={highlightedId}
        />
      </div>

      {/* 交互日志 (调试用) */}
      {showControls && interactionLog.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            交互日志:
          </div>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {interactionLog.map((log, index) => (
              <div
                key={index}
                className="text-xs text-gray-600 dark:text-gray-300 font-mono"
              >
                → {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
