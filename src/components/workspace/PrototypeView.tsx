"use client";

import { useMemo } from 'react';
import { useOutlineStore } from '@/stores/outlineStore';
import {
  TelegramCommandsPrototype,
  TelegramPermissionsPrototype,
  TelegramFileBrowserPrototype,
  TelegramProjectPrototype,
  TelegramMessagesPrototype,
  DesktopMetricsPrototype,
  DesktopSimulatorPrototype,
} from '@/components/prototypes';

interface PrototypeViewProps {
  mode: 'full' | 'thumbnail';
  prototypeId?: string;
  onClose?: () => void;
}

// 原型组件注册表 - 将原型ID映射到实际组件
const prototypeRegistry: Record<string, {
  name: string;
  component: React.ComponentType<Record<string, unknown>>;
  defaultProps?: Record<string, unknown>;
}> = {
  // C2ME Telegram Bot 原型
  'telegram-commands': {
    name: 'Bot 命令系统',
    component: TelegramCommandsPrototype as React.ComponentType<Record<string, unknown>>,
    defaultProps: {},
  },
  'telegram-permissions': {
    name: '权限控制系统',
    component: TelegramPermissionsPrototype as React.ComponentType<Record<string, unknown>>,
    defaultProps: {},
  },
  'telegram-filebrowser': {
    name: '文件浏览器',
    component: TelegramFileBrowserPrototype as React.ComponentType<Record<string, unknown>>,
    defaultProps: {},
  },
  'telegram-project': {
    name: '项目管理',
    component: TelegramProjectPrototype as React.ComponentType<Record<string, unknown>>,
    defaultProps: {},
  },
  'telegram-messages': {
    name: '消息处理',
    component: TelegramMessagesPrototype as React.ComponentType<Record<string, unknown>>,
    defaultProps: {},
  },
  // C2ME Desktop 原型
  'desktop-metrics': {
    name: '指标面板',
    component: DesktopMetricsPrototype as React.ComponentType<Record<string, unknown>>,
    defaultProps: {},
  },
  'desktop-simulator': {
    name: '消息模拟器',
    component: DesktopSimulatorPrototype as React.ComponentType<Record<string, unknown>>,
    defaultProps: {},
  },
};

// 根据节点内容推断原型ID
function inferPrototypeId(nodeId?: string, nodes?: Record<string, { title: string }>): string | null {
  if (!nodeId || !nodes) return null;
  const node = nodes[nodeId];
  if (!node) return null;

  const title = node.title.toLowerCase();

  // C2ME Telegram Bot 原型匹配
  if (title.includes('命令') || title.includes('command')) {
    return 'telegram-commands';
  }
  if (title.includes('权限') || title.includes('permission')) {
    return 'telegram-permissions';
  }
  if (title.includes('文件') || title.includes('file') || title.includes('浏览')) {
    return 'telegram-filebrowser';
  }
  if (title.includes('项目') || title.includes('project')) {
    return 'telegram-project';
  }
  if (title.includes('消息') || title.includes('message')) {
    return 'telegram-messages';
  }

  // C2ME Desktop 原型匹配
  if (title.includes('指标') || title.includes('metric') || title.includes('监控')) {
    return 'desktop-metrics';
  }
  if (title.includes('模拟') || title.includes('simulator') || title.includes('预览')) {
    return 'desktop-simulator';
  }

  return null;
}

// 缩略图视图 - 缩小版不可交互预览
function PrototypeThumbnailView({
  prototypeId,
  prototypeName
}: {
  prototypeId: string;
  prototypeName: string;
}) {
  const prototypeConfig = prototypeRegistry[prototypeId];

  if (!prototypeConfig) {
    return (
      <div className="h-full p-4">
        <div className="h-full border-2 border-dashed border-[var(--border-color)] rounded-lg flex items-center justify-center bg-[var(--nav-hover)]">
          <div className="text-center text-[var(--text-muted)]">
            <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <p className="text-sm">原型预览</p>
          </div>
        </div>
      </div>
    );
  }

  const Component = prototypeConfig.component;
  const props = prototypeConfig.defaultProps || {};

  return (
    <div className="h-full p-4 overflow-hidden">
      <div className="h-full border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--background)]">
        {/* 缩略图头部 */}
        <div className="px-3 py-2 bg-[var(--nav-hover)] border-b border-[var(--border-color)]">
          <span className="text-xs font-medium text-[var(--foreground)]">
            🎨 {prototypeName}
          </span>
        </div>
        {/* 缩小的原型预览 */}
        <div className="relative h-[calc(100%-36px)] overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none origin-top-left"
            style={{
              transform: 'scale(0.6)',
              width: '166.67%',
              height: '166.67%',
            }}
          >
            <div className="flex items-center justify-center h-full p-8">
              <Component {...props} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 完整视图 - 可交互的原型编辑器（无上下导航栏，直接展示原型）
function PrototypeFullView({
  prototypeId,
}: {
  prototypeId: string;
  prototypeName: string;
  onClose?: () => void;
}) {
  const prototypeConfig = prototypeRegistry[prototypeId];

  // 空状态
  if (!prototypeConfig) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--background)]">
        <div className="text-center text-[var(--text-muted)]">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <p>未找到原型组件</p>
          <p className="text-sm mt-1">请在文档中关联原型</p>
        </div>
      </div>
    );
  }

  const Component = prototypeConfig.component;

  // 直接展示原型，无边框无导航栏，占满容器
  return (
    <div className="h-full w-full flex items-center justify-center bg-[var(--background)]">
      <Component {...(prototypeConfig.defaultProps || {})} />
    </div>
  );
}

export function PrototypeView({ mode, prototypeId, onClose }: PrototypeViewProps) {
  const { nodes, selectedNodeId } = useOutlineStore();

  // 确定要显示的原型
  const resolvedPrototypeId = useMemo(() => {
    // 优先使用传入的 prototypeId
    if (prototypeId && prototypeRegistry[prototypeId]) {
      return prototypeId;
    }
    // 否则根据选中节点推断
    const inferred = inferPrototypeId(selectedNodeId ?? undefined, nodes);
    if (inferred) return inferred;
    // 默认显示命令系统
    return 'telegram-commands';
  }, [prototypeId, selectedNodeId, nodes]);

  const prototypeName = prototypeRegistry[resolvedPrototypeId]?.name || '原型';

  // 空状态
  if (!resolvedPrototypeId) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--background)]">
        <div className="text-center text-[var(--text-muted)]">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <p>暂无原型</p>
          <p className="text-sm mt-1">请先在文档中添加原型引用</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--background)]">
      {mode === 'thumbnail' ? (
        <PrototypeThumbnailView
          prototypeId={resolvedPrototypeId}
          prototypeName={prototypeName}
        />
      ) : (
        <PrototypeFullView
          prototypeId={resolvedPrototypeId}
          prototypeName={prototypeName}
          onClose={onClose}
        />
      )}
    </div>
  );
}
