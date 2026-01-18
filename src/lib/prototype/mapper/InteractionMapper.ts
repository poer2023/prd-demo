/**
 * 交互映射器
 * 将文档中的 InteractionRule 映射为可演示的 InteractionDemo
 */

import type { InteractionRule } from '@/lib/outline/types';
import type { InteractionDemo, PrototypeComponent, DemoStep } from '../types';

/**
 * 从交互规则生成演示
 */
export function mapInteractionToDemo(
  rule: InteractionRule,
  baseComponent?: PrototypeComponent
): InteractionDemo {
  // 创建默认的演示组件（如果没有提供）
  const demoComponent = baseComponent || createDefaultDemoComponent(rule);

  // 生成演示步骤
  const demoSteps = generateDemoSteps(rule, demoComponent);

  return {
    id: `demo_${rule.id}`,
    linkedRuleId: rule.id,
    trigger: rule.trigger,
    response: rule.response,
    demoComponent,
    demoSteps,
  };
}

/**
 * 批量映射所有交互规则
 */
export function mapAllInteractions(
  rules: InteractionRule[],
  componentMap?: Record<string, PrototypeComponent>
): InteractionDemo[] {
  return rules.map((rule) => {
    const baseComponent = componentMap?.[rule.id];
    return mapInteractionToDemo(rule, baseComponent);
  });
}

/**
 * 根据交互规则创建默认演示组件
 */
function createDefaultDemoComponent(rule: InteractionRule): PrototypeComponent {
  const trigger = rule.trigger.toLowerCase();

  // 根据触发条件推断组件类型
  if (trigger.includes('点击') || trigger.includes('click')) {
    if (trigger.includes('按钮') || trigger.includes('button')) {
      return {
        id: `comp_${rule.id}`,
        type: 'Button',
        props: {
          children: extractActionName(rule.trigger),
          variant: 'primary',
        },
      };
    }
  }

  if (trigger.includes('输入') || trigger.includes('input') || trigger.includes('填写')) {
    return {
      id: `comp_${rule.id}`,
      type: 'Input',
      props: {
        placeholder: extractActionName(rule.trigger),
        label: extractActionName(rule.trigger),
      },
    };
  }

  // 默认使用 Card 包裹 Text
  return {
    id: `comp_${rule.id}`,
    type: 'Card',
    props: { padding: 'md' },
    children: [
      {
        id: `text_${rule.id}`,
        type: 'Text',
        props: {
          children: rule.trigger,
          color: 'muted',
        },
      },
    ],
  };
}

/**
 * 从触发条件中提取动作名称
 */
function extractActionName(trigger: string): string {
  // 简单的中文/英文动作提取
  const patterns = [
    /点击[「"']?(.+?)[」"']?按钮/,
    /点击(.+)/,
    /输入(.+)/,
    /填写(.+)/,
    /click\s+(.+)/i,
    /input\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = trigger.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return trigger;
}

/**
 * 生成演示步骤
 */
function generateDemoSteps(
  rule: InteractionRule,
  component: PrototypeComponent
): DemoStep[] {
  const steps: DemoStep[] = [];
  const trigger = rule.trigger.toLowerCase();

  // 步骤1: 高亮目标元素
  steps.push({
    id: `step_${rule.id}_1`,
    action: 'highlight',
    targetId: component.id,
    duration: 1000,
  });

  // 步骤2: 模拟交互动作
  if (trigger.includes('点击') || trigger.includes('click')) {
    steps.push({
      id: `step_${rule.id}_2`,
      action: 'click',
      targetId: component.id,
      duration: 500,
    });
  } else if (trigger.includes('输入') || trigger.includes('input')) {
    steps.push({
      id: `step_${rule.id}_2`,
      action: 'input',
      targetId: component.id,
      value: '示例输入',
      duration: 1500,
    });
  } else {
    steps.push({
      id: `step_${rule.id}_2`,
      action: 'wait',
      duration: 800,
    });
  }

  // 步骤3: 显示结果
  steps.push({
    id: `step_${rule.id}_3`,
    action: 'showResult',
    duration: 1500,
  });

  return steps;
}

/**
 * InteractionMapper 类 - 提供更完整的映射功能
 */
export class InteractionMapper {
  private componentMap: Map<string, PrototypeComponent> = new Map();

  /**
   * 注册组件映射
   */
  registerComponent(ruleId: string, component: PrototypeComponent): void {
    this.componentMap.set(ruleId, component);
  }

  /**
   * 批量注册组件
   */
  registerComponents(mappings: Record<string, PrototypeComponent>): void {
    Object.entries(mappings).forEach(([ruleId, component]) => {
      this.componentMap.set(ruleId, component);
    });
  }

  /**
   * 映射单个规则
   */
  map(rule: InteractionRule): InteractionDemo {
    const component = this.componentMap.get(rule.id);
    return mapInteractionToDemo(rule, component);
  }

  /**
   * 映射所有规则
   */
  mapAll(rules: InteractionRule[]): InteractionDemo[] {
    return rules.map((rule) => this.map(rule));
  }

  /**
   * 清除所有映射
   */
  clear(): void {
    this.componentMap.clear();
  }
}

// 默认导出一个单例
export const defaultInteractionMapper = new InteractionMapper();
