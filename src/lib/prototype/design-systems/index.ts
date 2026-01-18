/**
 * 设计系统模块导出
 */

export * from './types';
export * from './registry';
export * from './hooks';

// 设计系统实现
export { defaultDesignSystem } from './default';
export { telegramDesignSystem } from './telegram';
