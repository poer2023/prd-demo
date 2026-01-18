/**
 * Telegram 设计系统
 * 用于展示 Telegram Bot 相关的原型
 */

import type { DesignSystem, ComponentSpec } from '../types';
import { telegramTokens } from './tokens';
import { ChatMessage } from './components/ChatMessage';
import { InlineKeyboard } from './components/InlineKeyboard';
import { CommandButton } from './components/CommandButton';

// Telegram 组件规格
const telegramComponentSpecs: Record<string, ComponentSpec> = {
  ChatMessage: {
    name: 'ChatMessage',
    category: 'display',
    props: [
      { name: 'children', type: 'children', required: true, description: '消息内容' },
      { name: 'variant', type: 'enum', options: ['incoming', 'outgoing'], default: 'incoming' },
      { name: 'avatar', type: 'string', description: '头像 URL' },
      { name: 'username', type: 'string', description: '用户名' },
      { name: 'time', type: 'string', description: '发送时间' },
      { name: 'status', type: 'enum', options: ['sent', 'delivered', 'read'], description: '消息状态' },
    ],
    variants: [
      { name: 'Incoming', props: { variant: 'incoming' } },
      { name: 'Outgoing', props: { variant: 'outgoing' } },
    ],
    defaultProps: { variant: 'incoming' },
  },

  InlineKeyboard: {
    name: 'InlineKeyboard',
    category: 'input',
    props: [
      { name: 'buttons', type: 'string', required: true, description: '按钮配置（二维数组）' },
    ],
    defaultProps: {},
  },

  CommandButton: {
    name: 'CommandButton',
    category: 'input',
    props: [
      { name: 'command', type: 'string', required: true, description: '命令名（不含/）' },
      { name: 'description', type: 'string', description: '命令描述' },
    ],
    defaultProps: {},
  },
};

export const telegramDesignSystem: DesignSystem = {
  id: 'telegram',
  name: 'Telegram Design System',
  version: '1.0.0',
  tokens: telegramTokens,
  components: telegramComponentSpecs,
  componentMap: {
    ChatMessage: ChatMessage as unknown as React.ComponentType<Record<string, unknown>>,
    InlineKeyboard: InlineKeyboard as unknown as React.ComponentType<Record<string, unknown>>,
    CommandButton: CommandButton as unknown as React.ComponentType<Record<string, unknown>>,
  },
};

// 导出组件和 tokens
export * from './components';
export * from './tokens';
