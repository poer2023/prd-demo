/**
 * 默认设计系统
 */

import type { DesignSystem } from '../types';
import { defaultTokens } from './tokens';
import { defaultComponentSpecs } from './specs';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Card } from './components/Card';
import { Container } from './components/Container';
import { Text } from './components/Text';
import { Stack } from './components/Stack';

export const defaultDesignSystem: DesignSystem = {
  id: 'default',
  name: 'Default Design System',
  version: '1.0.0',
  tokens: defaultTokens,
  components: defaultComponentSpecs,
  componentMap: {
    Button: Button as React.ComponentType<Record<string, unknown>>,
    Input: Input as React.ComponentType<Record<string, unknown>>,
    Card: Card as React.ComponentType<Record<string, unknown>>,
    Container: Container as React.ComponentType<Record<string, unknown>>,
    Text: Text as React.ComponentType<Record<string, unknown>>,
    Stack: Stack as React.ComponentType<Record<string, unknown>>,
  },
};

// 导出组件和 tokens
export * from './components';
export * from './tokens';
export * from './specs';
