/**
 * 原型系统初始化
 * 在应用启动时调用，注册所有设计系统
 */

import { designSystemRegistry } from './design-systems/registry';
import { defaultDesignSystem } from './design-systems/default';
import { telegramDesignSystem } from './design-systems/telegram';

let initialized = false;

/**
 * 初始化原型系统
 * 注册所有内置设计系统
 */
export function initializePrototypeSystem(): void {
  if (initialized) {
    return;
  }

  // 注册默认设计系统
  designSystemRegistry.register(defaultDesignSystem);

  // 注册 Telegram 设计系统
  designSystemRegistry.register(telegramDesignSystem);

  // 设置默认激活的设计系统
  designSystemRegistry.setActive('default');

  initialized = true;

  console.log('[Prototype System] Initialized with design systems:',
    designSystemRegistry.list().map(ds => ds.name).join(', ')
  );
}

/**
 * 检查是否已初始化
 */
export function isPrototypeSystemInitialized(): boolean {
  return initialized;
}
