/**
 * AI 原型生成器 (基础结构)
 * 根据文档内容生成原型组件
 */

import type { OutlineNode } from '@/lib/outline/types';
import type { PagePrototype, InteractionDemo, PrototypeComponent } from '../types';
import { mapAllInteractions } from '../mapper';

/**
 * 原型生成器类
 */
export class PrototypeGenerator {
  private designSystemId: string;

  constructor(designSystemId: string = 'default') {
    this.designSystemId = designSystemId;
  }

  /**
   * 从文档节点生成页面原型
   */
  async generatePagePrototype(node: OutlineNode): Promise<PagePrototype> {
    // 分析节点内容
    const { title, contentBlocks } = node;

    // 提取交互规则
    const interactionBlock = contentBlocks.find((b) => b.type === 'interaction');
    const interactions = interactionBlock?.type === 'interaction' ? interactionBlock.rules : [];

    // 生成根组件
    const rootComponent = this.generateRootComponent(node, interactions);

    return {
      id: `proto_${node.id}`,
      name: title,
      description: this.extractDescription(node),
      rootComponent,
    };
  }

  /**
   * 生成所有交互演示
   */
  async generateInteractionDemos(node: OutlineNode): Promise<InteractionDemo[]> {
    const interactionBlock = node.contentBlocks.find((b) => b.type === 'interaction');
    if (interactionBlock?.type !== 'interaction') {
      return [];
    }

    return mapAllInteractions(interactionBlock.rules);
  }

  /**
   * 生成根组件
   */
  private generateRootComponent(
    node: OutlineNode,
    _interactions: { id: string; trigger: string; response: string }[]
  ): PrototypeComponent {
    const title = node.title.toLowerCase();

    // 根据标题推断页面类型
    if (title.includes('登录') || title.includes('login')) {
      return this.generateLoginPage();
    }

    if (title.includes('注册') || title.includes('register') || title.includes('signup')) {
      return this.generateRegisterPage();
    }

    if (title.includes('首页') || title.includes('home') || title.includes('dashboard')) {
      return this.generateDashboardPage();
    }

    // 默认生成通用页面
    return this.generateGenericPage(node.title);
  }

  /**
   * 生成登录页原型
   */
  private generateLoginPage(): PrototypeComponent {
    return {
      id: 'login_page',
      type: 'Card',
      props: { padding: 'lg', shadow: 'md' },
      children: [
        {
          id: 'login_title',
          type: 'Text',
          props: { as: 'h2', size: '2xl', weight: 'bold', children: '登录' },
        },
        {
          id: 'login_form',
          type: 'Stack',
          props: { gap: 'md' },
          children: [
            {
              id: 'login_phone',
              type: 'Input',
              props: { label: '手机号', placeholder: '请输入手机号', type: 'text' },
            },
            {
              id: 'login_code',
              type: 'Input',
              props: { label: '验证码', placeholder: '请输入验证码', type: 'text' },
            },
            {
              id: 'login_submit',
              type: 'Button',
              props: { children: '登录', variant: 'primary', fullWidth: true },
              interactions: [
                {
                  id: 'login_click',
                  trigger: 'click',
                  action: { type: 'navigate', target: '/home' },
                },
              ],
            },
          ],
        },
      ],
    };
  }

  /**
   * 生成注册页原型
   */
  private generateRegisterPage(): PrototypeComponent {
    return {
      id: 'register_page',
      type: 'Card',
      props: { padding: 'lg', shadow: 'md' },
      children: [
        {
          id: 'register_title',
          type: 'Text',
          props: { as: 'h2', size: '2xl', weight: 'bold', children: '注册' },
        },
        {
          id: 'register_form',
          type: 'Stack',
          props: { gap: 'md' },
          children: [
            {
              id: 'register_phone',
              type: 'Input',
              props: { label: '手机号', placeholder: '请输入手机号' },
            },
            {
              id: 'register_code',
              type: 'Input',
              props: { label: '验证码', placeholder: '请输入验证码' },
            },
            {
              id: 'register_password',
              type: 'Input',
              props: { label: '密码', placeholder: '请设置密码', type: 'password' },
            },
            {
              id: 'register_submit',
              type: 'Button',
              props: { children: '注册', variant: 'primary', fullWidth: true },
            },
          ],
        },
      ],
    };
  }

  /**
   * 生成仪表盘页原型
   */
  private generateDashboardPage(): PrototypeComponent {
    return {
      id: 'dashboard_page',
      type: 'Stack',
      props: { gap: 'lg' },
      children: [
        {
          id: 'dashboard_header',
          type: 'Text',
          props: { as: 'h1', size: '3xl', weight: 'bold', children: '首页' },
        },
        {
          id: 'dashboard_cards',
          type: 'Stack',
          props: { direction: 'row', gap: 'md' },
          children: [
            {
              id: 'card_1',
              type: 'Card',
              props: { padding: 'md' },
              children: [
                {
                  id: 'card_1_text',
                  type: 'Text',
                  props: { children: '统计卡片 1', color: 'muted' },
                },
              ],
            },
            {
              id: 'card_2',
              type: 'Card',
              props: { padding: 'md' },
              children: [
                {
                  id: 'card_2_text',
                  type: 'Text',
                  props: { children: '统计卡片 2', color: 'muted' },
                },
              ],
            },
          ],
        },
      ],
    };
  }

  /**
   * 生成通用页面原型
   */
  private generateGenericPage(title: string): PrototypeComponent {
    return {
      id: 'generic_page',
      type: 'Stack',
      props: { gap: 'lg' },
      children: [
        {
          id: 'page_title',
          type: 'Text',
          props: { as: 'h1', size: '2xl', weight: 'bold', children: title },
        },
        {
          id: 'page_content',
          type: 'Card',
          props: { padding: 'lg' },
          children: [
            {
              id: 'placeholder_text',
              type: 'Text',
              props: { children: '页面内容区域', color: 'muted' },
            },
          ],
        },
      ],
    };
  }

  /**
   * 从节点提取描述
   */
  private extractDescription(node: OutlineNode): string {
    const markdownBlock = node.contentBlocks.find((b) => b.type === 'markdown');
    if (markdownBlock?.type === 'markdown') {
      // 提取第一段非标题文本
      const lines = markdownBlock.content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          return trimmed.length > 100 ? trimmed.slice(0, 100) + '...' : trimmed;
        }
      }
    }
    return '';
  }
}

// 默认生成器实例
export const defaultPrototypeGenerator = new PrototypeGenerator();
