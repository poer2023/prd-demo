/**
 * 原型状态管理
 * 管理原型相关的状态
 */

import { create } from 'zustand';
import type { PagePrototype, InteractionDemo } from '@/lib/prototype/types';

interface PrototypeState {
  // 当前页面原型
  currentPrototype: PagePrototype | null;
  // 交互演示列表
  interactionDemos: InteractionDemo[];
  // 当前激活的设计系统 ID
  activeDesignSystemId: string;
  // 是否正在生成
  isGenerating: boolean;
}

interface PrototypeActions {
  setCurrentPrototype: (prototype: PagePrototype | null) => void;
  setInteractionDemos: (demos: InteractionDemo[]) => void;
  setActiveDesignSystemId: (id: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  reset: () => void;
}

type PrototypeStore = PrototypeState & PrototypeActions;

const initialState: PrototypeState = {
  currentPrototype: null,
  interactionDemos: [],
  activeDesignSystemId: 'default',
  isGenerating: false,
};

export const usePrototypeStore = create<PrototypeStore>((set) => ({
  ...initialState,

  setCurrentPrototype: (prototype) => set({ currentPrototype: prototype }),

  setInteractionDemos: (demos) => set({ interactionDemos: demos }),

  setActiveDesignSystemId: (id) => set({ activeDesignSystemId: id }),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  reset: () => set(initialState),
}));
