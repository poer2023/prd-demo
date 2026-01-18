/**
 * 原型系统核心类型定义
 */

// ==================== 设计 Tokens ====================

export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    error: string;
    warning: string;
  };
  spacing: Record<string, string>;  // xs, sm, md, lg, xl
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, string>;
  };
  radii: Record<string, string>;
  shadows: Record<string, string>;
}

// ==================== 组件规格 ====================

export type ComponentCategory = 'layout' | 'input' | 'display' | 'feedback' | 'navigation';

export interface PropSpec {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'children';
  required?: boolean;
  default?: unknown;
  options?: string[];  // for enum type
  description?: string;
}

export interface VariantSpec {
  name: string;
  props: Record<string, unknown>;
}

export interface ComponentSpec {
  name: string;
  category: ComponentCategory;
  props: PropSpec[];
  variants?: VariantSpec[];
  defaultProps?: Record<string, unknown>;
}

// ==================== 设计系统 ====================

export interface DesignSystem {
  id: string;
  name: string;
  version: string;
  tokens: DesignTokens;
  components: Record<string, ComponentSpec>;
  // React 组件实现映射
  componentMap: Record<string, React.ComponentType<Record<string, unknown>>>;
}

// ==================== 原型组件 ====================

export interface ComponentInteraction {
  id: string;
  trigger: 'click' | 'hover' | 'focus' | 'change' | 'submit';
  action: InteractionAction;
}

export type InteractionAction =
  | { type: 'navigate'; target: string }
  | { type: 'setState'; key: string; value: unknown }
  | { type: 'showToast'; message: string }
  | { type: 'toggleVisible'; targetId: string }
  | { type: 'custom'; handler: string };

export interface PrototypeComponent {
  id: string;
  type: string;                     // 组件类型，如 'Button', 'Input'
  props: Record<string, unknown>;
  children?: PrototypeComponent[];
  interactions?: ComponentInteraction[];
  // 关联的交互规则 ID
  linkedInteractionRuleId?: string;
}

// ==================== 页面原型 ====================

export interface PagePrototype {
  id: string;
  name: string;
  description?: string;
  rootComponent: PrototypeComponent;
  thumbnail?: string;               // 缓存的缩略图
}

// ==================== 交互演示 ====================

export interface DemoStep {
  id: string;
  action: 'highlight' | 'click' | 'input' | 'wait' | 'showResult';
  targetId?: string;
  value?: string;
  duration?: number;
}

export interface InteractionDemo {
  id: string;
  linkedRuleId: string;             // 关联的 InteractionRule.id
  trigger: string;                  // 复制自 rule.trigger
  response: string;                 // 复制自 rule.response
  demoComponent: PrototypeComponent; // 演示用的组件
  demoSteps: DemoStep[];            // 演示步骤
}

// ==================== 原型 Block (扩展) ====================

export interface PrototypeBlockExtended {
  type: 'prototype';
  id: string;
  designSystemId: string;           // 使用的设计系统
  pagePrototype: PagePrototype;     // 页面原型定义
  interactionDemos: InteractionDemo[]; // 交互演示列表
}
