/**
 * 分屏状态管理
 * 使用 Zustand 进行状态管理
 */

import { create } from 'zustand';

// 视图模式
export type WorkspaceView = 'doc' | 'prototype' | 'split';

// 分屏内容类型
export type SplitContent = 'doc' | 'prototype';

// 分屏模式
export type SplitMode = 'doc-only' | 'prototype-only' | 'doc-focused' | 'prototype-focused' | 'equal';

// 分屏状态
export interface SplitState {
  mode: SplitMode;
  leftRatio: number; // 0.1 ~ 0.9
  leftContent: SplitContent;
  rightContent: SplitContent;
  activeBlockId?: string; // 当前激活的 Block ID
}

// 打开分屏的配置
export interface OpenSplitConfig {
  mode?: SplitMode;
  leftRatio?: number;
  leftContent?: SplitContent;
  rightContent?: SplitContent;
  activeBlockId?: string;
}

interface SplitStoreState {
  workspaceView: WorkspaceView;
  splitState: SplitState;
}

interface SplitStoreActions {
  setWorkspaceView: (view: WorkspaceView) => void;
  openSplit: (config?: OpenSplitConfig) => void;
  setLeftRatio: (ratio: number) => void;
  closeSplit: () => void;
  setActiveBlockId: (id: string | undefined) => void;
}

type SplitStore = SplitStoreState & SplitStoreActions;

// 默认分屏状态
const defaultSplitState: SplitState = {
  mode: 'equal',
  leftRatio: 0.5,
  leftContent: 'doc',
  rightContent: 'prototype',
  activeBlockId: undefined,
};

// 辅助函数：限制比例在 0.1 ~ 0.9 之间
const clampRatio = (ratio: number): number => {
  return Math.min(0.9, Math.max(0.1, ratio));
};

export const useSplitStore = create<SplitStore>((set) => ({
  // 初始状态
  workspaceView: 'doc',
  splitState: defaultSplitState,

  // 切换视图模式
  setWorkspaceView: (view) => set({ workspaceView: view }),

  // 打开分屏视图
  openSplit: (config) => set((state) => {
    const newSplitState: SplitState = {
      mode: config?.mode ?? state.splitState.mode,
      leftRatio: config?.leftRatio !== undefined
        ? clampRatio(config.leftRatio)
        : state.splitState.leftRatio,
      leftContent: config?.leftContent ?? state.splitState.leftContent,
      rightContent: config?.rightContent ?? state.splitState.rightContent,
      activeBlockId: config?.activeBlockId ?? state.splitState.activeBlockId,
    };

    return {
      workspaceView: 'split',
      splitState: newSplitState,
    };
  }),

  // 设置左侧面板比例
  setLeftRatio: (ratio) => set((state) => ({
    splitState: {
      ...state.splitState,
      leftRatio: clampRatio(ratio),
    },
  })),

  // 关闭分屏，返回单视图
  closeSplit: () => set((state) => ({
    workspaceView: state.splitState.leftContent === 'doc' ? 'doc' : 'prototype',
  })),

  // 设置当前激活的 Block ID
  setActiveBlockId: (id) => set((state) => ({
    splitState: {
      ...state.splitState,
      activeBlockId: id,
    },
  })),
}));
