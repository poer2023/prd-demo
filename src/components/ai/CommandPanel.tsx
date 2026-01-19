'use client';

/**
 * AI 命令面板
 * 底部抽屉式交互面板，用于输入需求和查看 AI 响应
 */

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useOutlineStore } from '@/stores/outlineStore';
import { useVersionStore } from '@/stores/versionStore';
import { aiDocService } from '@/lib/ai-doc/service';
import { versionService } from '@/lib/version/service';
import type { AIEditResult } from '@/lib/ai-doc/types';

interface CommandPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenChangePreview: (result: AIEditResult) => void;
}

export function CommandPanel({ isOpen, onToggle, onOpenChangePreview }: CommandPanelProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    currentInput,
    isLoading,
    error,
    focusedNodeIds,
    setCurrentInput,
    addUserMessage,
    addAssistantMessage,
    setLoading,
    setError,
    setFocusedNodeIds,
    clearMessages,
  } = useChatStore();

  const { nodes, rootIds, selectedNodeId } = useOutlineStore();

  // 同步选中节点到聚焦节点
  useEffect(() => {
    if (selectedNodeId && !focusedNodeIds.includes(selectedNodeId)) {
      setFocusedNodeIds([selectedNodeId]);
    }
  }, [selectedNodeId, focusedNodeIds, setFocusedNodeIds]);

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 处理发送消息
  const handleSend = async () => {
    if (!currentInput.trim() || isLoading) return;

    const userMessage = addUserMessage(currentInput);
    setLoading(true);
    setError(null);

    try {
      // 构建文档上下文
      const context = aiDocService.buildDocumentContext(
        nodes,
        rootIds,
        focusedNodeIds.length > 0 ? focusedNodeIds : (selectedNodeId ? [selectedNodeId] : rootIds)
      );

      // 调用 AI 服务
      const response = await aiDocService.generateEditInstructions({
        prompt: currentInput,
        context,
        conversationHistory: messages,
      });

      if (response.success && response.result) {
        const result = response.result;
        const content = result.reasoning || result.summary;
        addAssistantMessage(content, result);

        // 如果有修改指令，显示预览
        if (result.instructions.length > 0) {
          onOpenChangePreview(result);
        }
      } else {
        addAssistantMessage(response.error || '抱歉，处理请求时出错了。');
        setError(response.error || '未知错误');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误';
      addAssistantMessage(`抱歉，发生错误：${errorMsg}`);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  // 快捷操作
  const quickActions = [
    { icon: '📝', label: '修改文档', prompt: '请帮我修改以下内容：' },
    { icon: '➕', label: '新增节点', prompt: '请在当前节点下新增一个子节点：' },
    { icon: '🔄', label: '优化内容', prompt: '请帮我优化这个节点的内容，使其更清晰专业' },
    { icon: '📋', label: '生成验收标准', prompt: '请为这个功能生成验收标准' },
  ];

  // 获取选中节点的标题
  const getSelectedNodeTitles = () => {
    if (focusedNodeIds.length === 0) return '未选中节点';
    return focusedNodeIds
      .map((id) => nodes[id]?.title)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg transition-transform duration-300 ${
        isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'
      }`}
      style={{ height: '400px', zIndex: 50 }}
    >
      {/* 标题栏 */}
      <div
        className="h-12 px-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="font-medium text-gray-900 dark:text-white">AI 助手</span>
          {focusedNodeIds.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              · 选中节点: {getSelectedNodeTitles()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearMessages();
              }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              清空对话
            </button>
          )}
          <span className="text-gray-400">{isOpen ? '▼' : '▲'}</span>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="h-[calc(100%-48px-120px)] overflow-y-auto px-4 py-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <span className="text-4xl mb-2">💬</span>
            <p>输入你的需求，AI 会帮你修改文档</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span>{msg.role === 'user' ? '👤' : '🤖'}</span>
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.editResult && msg.editResult.instructions.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {!msg.applied && !msg.rejected && (
                            <>
                              <button
                                onClick={() => onOpenChangePreview(msg.editResult!)}
                                className="text-sm px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                              >
                                查看变更
                              </button>
                            </>
                          )}
                          {msg.applied && (
                            <span className="text-sm text-green-600 dark:text-green-400">
                              ✓ 已应用
                            </span>
                          )}
                          {msg.rejected && (
                            <span className="text-sm text-red-600 dark:text-red-400">
                              ✗ 已拒绝
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                  <span className="animate-pulse">🤖 思考中...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="h-[120px] px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        {/* 快捷操作 */}
        <div className="flex gap-2 mb-2 overflow-x-auto">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setCurrentInput(action.prompt)}
              className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded whitespace-nowrap"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* 输入框 */}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的需求... (Cmd+Enter 发送)"
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !currentInput.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium"
          >
            发送
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
