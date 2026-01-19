'use client';

/**
 * 变更预览对话框
 * 显示 AI 将要进行的修改，支持选择性应用
 */

import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useOutlineStore } from '@/stores/outlineStore';
import { useVersionStore } from '@/stores/versionStore';
import { aiDocService } from '@/lib/ai-doc/service';
import { versionService } from '@/lib/version/service';
import type { AIEditInstruction, AIEditResult } from '@/lib/ai-doc/types';

interface ChangePreviewProps {
  isOpen: boolean;
  result: AIEditResult | null;
  onClose: () => void;
  onApply: () => void;
}

export function ChangePreview({ isOpen, result, onClose, onApply }: ChangePreviewProps) {
  const {
    editPreview,
    toggleInstructionSelection,
    selectAllInstructions,
    markMessageApplied,
    messages,
  } = useChatStore();

  const { nodes, rootIds, applyBatchChanges, getSnapshot } = useOutlineStore();
  const { createVersion } = useVersionStore();

  if (!isOpen || !result) return null;

  const { instructions, summary } = result;
  const { selectedInstructionIds } = editPreview;

  // 获取操作类型的显示文本
  const getOperationLabel = (operation: AIEditInstruction['operation']) => {
    const labels: Record<string, string> = {
      create_node: '新增节点',
      update_node: '更新节点',
      delete_node: '删除节点',
      create_block: '新增内容块',
      update_block: '更新内容块',
      delete_block: '删除内容块',
    };
    return labels[operation] || operation;
  };

  // 获取操作类型的颜色
  const getOperationColor = (operation: AIEditInstruction['operation']) => {
    if (operation.startsWith('create')) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
    if (operation.startsWith('update')) return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
    if (operation.startsWith('delete')) return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
    return 'text-gray-600 bg-gray-100';
  };

  // 获取目标节点名称
  const getTargetName = (instruction: AIEditInstruction) => {
    const node = nodes[instruction.target.nodeId];
    if (node) return node.title;
    if (instruction.data?.title) return instruction.data.title;
    return instruction.target.nodeId;
  };

  // 应用选中的变更
  const handleApply = () => {
    // 保存当前状态快照
    const beforeSnapshot = getSnapshot();

    // 筛选选中的指令
    const selectedInstructions = instructions.filter((i) =>
      selectedInstructionIds.has(i.id)
    );

    if (selectedInstructions.length === 0) {
      onClose();
      return;
    }

    // 转换为批量操作
    const operations = aiDocService.instructionsToBatchOperations(selectedInstructions);

    // 应用变更
    applyBatchChanges(operations);

    // 获取变更后的状态
    const afterSnapshot = getSnapshot();

    // 计算变更
    const changes = versionService.computeChanges(beforeSnapshot, afterSnapshot);

    // 创建版本
    createVersion(afterSnapshot, {
      source: 'ai',
      changes,
      summary: result.summary,
      aiMetadata: {
        prompt: messages[messages.length - 2]?.content || '',
        model: 'claude-sonnet-4-20250514',
        tokensUsed: 0,
        reasoning: result.reasoning,
      },
    });

    // 标记消息为已应用
    const lastAssistantMessage = [...messages].reverse().find(
      (m) => m.role === 'assistant' && m.editResult
    );
    if (lastAssistantMessage) {
      markMessageApplied(lastAssistantMessage.id);
    }

    onApply();
    onClose();
  };

  // 拒绝变更
  const handleReject = () => {
    const lastAssistantMessage = [...messages].reverse().find(
      (m) => m.role === 'assistant' && m.editResult
    );
    if (lastAssistantMessage) {
      useChatStore.getState().markMessageRejected(lastAssistantMessage.id);
    }
    onClose();
  };

  const allSelected = instructions.every((i) => selectedInstructionIds.has(i.id));
  const noneSelected = instructions.every((i) => !selectedInstructionIds.has(i.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* 标题 */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            变更预览
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {summary}
          </p>
        </div>

        {/* 变更列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* 全选控制 */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              共 {instructions.length} 项变更，已选中 {selectedInstructionIds.size} 项
            </span>
            <button
              onClick={() => selectAllInstructions(!allSelected)}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              {allSelected ? '取消全选' : '全选'}
            </button>
          </div>

          {/* 变更项列表 */}
          <div className="space-y-3">
            {instructions.map((instruction) => (
              <div
                key={instruction.id}
                className={`p-4 rounded-lg border ${
                  selectedInstructionIds.has(instruction.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 选择框 */}
                  <input
                    type="checkbox"
                    checked={selectedInstructionIds.has(instruction.id)}
                    onChange={() => toggleInstructionSelection(instruction.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />

                  {/* 内容 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${getOperationColor(
                          instruction.operation
                        )}`}
                      >
                        {getOperationLabel(instruction.operation)}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getTargetName(instruction)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {instruction.reason}
                    </p>

                    {/* 显示具体变更内容 */}
                    {instruction.data && (
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                        {instruction.data.title && (
                          <div>
                            <span className="text-gray-500">标题: </span>
                            <span className="text-gray-900 dark:text-white">
                              {instruction.data.title}
                            </span>
                          </div>
                        )}
                        {instruction.data.content && (
                          <div className="mt-1">
                            <span className="text-gray-500">内容: </span>
                            <span className="text-gray-900 dark:text-white line-clamp-2">
                              {instruction.data.content}
                            </span>
                          </div>
                        )}
                        {instruction.data.flowType && (
                          <div className="mt-1">
                            <span className="text-gray-500">类型: </span>
                            <span className="text-gray-900 dark:text-white">
                              {instruction.data.flowType}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            拒绝
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handleApply}
            disabled={noneSelected}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg"
          >
            应用选中的变更 ({selectedInstructionIds.size})
          </button>
        </div>
      </div>
    </div>
  );
}
