/**
 * 对话状态管理
 * 管理 AI 对话历史和编辑预览状态
 */

import { create } from 'zustand';
import type { ChatMessage, AIEditResult, AIEditInstruction, EditPreviewState } from '@/lib/ai-doc/types';

// 生成唯一 ID
const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface ChatState {
  // 对话历史
  messages: ChatMessage[];

  // 当前输入
  currentInput: string;

  // 是否正在加载
  isLoading: boolean;

  // 错误信息
  error: string | null;

  // 编辑预览状态
  editPreview: EditPreviewState;

  // 选中的节点 ID（用于上下文）
  focusedNodeIds: string[];
}

interface ChatActions {
  // 发送消息
  addUserMessage: (content: string) => ChatMessage;

  // 添加 AI 响应
  addAssistantMessage: (content: string, editResult?: AIEditResult) => ChatMessage;

  // 更新当前输入
  setCurrentInput: (input: string) => void;

  // 设置加载状态
  setLoading: (loading: boolean) => void;

  // 设置错误
  setError: (error: string | null) => void;

  // 清空对话历史
  clearMessages: () => void;

  // 设置聚焦节点
  setFocusedNodeIds: (nodeIds: string[]) => void;

  // 添加聚焦节点
  addFocusedNodeId: (nodeId: string) => void;

  // 移除聚焦节点
  removeFocusedNodeId: (nodeId: string) => void;

  // 打开编辑预览
  openEditPreview: (instructions: AIEditInstruction[], summary: string) => void;

  // 关闭编辑预览
  closeEditPreview: () => void;

  // 切换指令选择状态
  toggleInstructionSelection: (instructionId: string) => void;

  // 全选/取消全选指令
  selectAllInstructions: (select: boolean) => void;

  // 标记消息为已应用
  markMessageApplied: (messageId: string) => void;

  // 标记消息为已拒绝
  markMessageRejected: (messageId: string) => void;

  // 获取对话历史（用于 AI 上下文）
  getConversationHistory: () => ChatMessage[];
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set, get) => ({
  // 初始状态
  messages: [],
  currentInput: '',
  isLoading: false,
  error: null,
  focusedNodeIds: [],
  editPreview: {
    isOpen: false,
    instructions: [],
    summary: '',
    selectedInstructionIds: new Set(),
  },

  // 发送用户消息
  addUserMessage: (content) => {
    const message: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, message],
      currentInput: '',
    }));

    return message;
  },

  // 添加 AI 响应
  addAssistantMessage: (content, editResult) => {
    const message: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      editResult,
    };

    set((state) => ({
      messages: [...state.messages, message],
    }));

    return message;
  },

  // 更新当前输入
  setCurrentInput: (input) => set({ currentInput: input }),

  // 设置加载状态
  setLoading: (loading) => set({ isLoading: loading }),

  // 设置错误
  setError: (error) => set({ error }),

  // 清空对话历史
  clearMessages: () => set({ messages: [], error: null }),

  // 设置聚焦节点
  setFocusedNodeIds: (nodeIds) => set({ focusedNodeIds: nodeIds }),

  // 添加聚焦节点
  addFocusedNodeId: (nodeId) =>
    set((state) => ({
      focusedNodeIds: state.focusedNodeIds.includes(nodeId)
        ? state.focusedNodeIds
        : [...state.focusedNodeIds, nodeId],
    })),

  // 移除聚焦节点
  removeFocusedNodeId: (nodeId) =>
    set((state) => ({
      focusedNodeIds: state.focusedNodeIds.filter((id) => id !== nodeId),
    })),

  // 打开编辑预览
  openEditPreview: (instructions, summary) =>
    set({
      editPreview: {
        isOpen: true,
        instructions,
        summary,
        selectedInstructionIds: new Set(instructions.map((i) => i.id)),
      },
    }),

  // 关闭编辑预览
  closeEditPreview: () =>
    set((state) => ({
      editPreview: {
        ...state.editPreview,
        isOpen: false,
      },
    })),

  // 切换指令选择状态
  toggleInstructionSelection: (instructionId) =>
    set((state) => {
      const newSelected = new Set(state.editPreview.selectedInstructionIds);
      if (newSelected.has(instructionId)) {
        newSelected.delete(instructionId);
      } else {
        newSelected.add(instructionId);
      }
      return {
        editPreview: {
          ...state.editPreview,
          selectedInstructionIds: newSelected,
        },
      };
    }),

  // 全选/取消全选指令
  selectAllInstructions: (select) =>
    set((state) => ({
      editPreview: {
        ...state.editPreview,
        selectedInstructionIds: select
          ? new Set(state.editPreview.instructions.map((i) => i.id))
          : new Set(),
      },
    })),

  // 标记消息为已应用
  markMessageApplied: (messageId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, applied: true, rejected: false } : msg
      ),
    })),

  // 标记消息为已拒绝
  markMessageRejected: (messageId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, rejected: true, applied: false } : msg
      ),
    })),

  // 获取对话历史
  getConversationHistory: () => {
    return get().messages;
  },
}));
