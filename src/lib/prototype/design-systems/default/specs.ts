/**
 * 默认设计系统 - 组件规格定义
 */

import type { ComponentSpec } from '../types';

export const defaultComponentSpecs: Record<string, ComponentSpec> = {
  Button: {
    name: 'Button',
    category: 'input',
    props: [
      { name: 'children', type: 'children', required: true, description: '按钮文本' },
      { name: 'variant', type: 'enum', options: ['primary', 'secondary', 'outline', 'ghost'], default: 'primary' },
      { name: 'size', type: 'enum', options: ['sm', 'md', 'lg'], default: 'md' },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'fullWidth', type: 'boolean', default: false },
    ],
    variants: [
      { name: 'Primary', props: { variant: 'primary' } },
      { name: 'Secondary', props: { variant: 'secondary' } },
      { name: 'Outline', props: { variant: 'outline' } },
      { name: 'Ghost', props: { variant: 'ghost' } },
    ],
    defaultProps: { variant: 'primary', size: 'md' },
  },

  Input: {
    name: 'Input',
    category: 'input',
    props: [
      { name: 'placeholder', type: 'string', description: '占位符文本' },
      { name: 'type', type: 'enum', options: ['text', 'password', 'email', 'number'], default: 'text' },
      { name: 'value', type: 'string' },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'error', type: 'boolean', default: false },
      { name: 'label', type: 'string', description: '标签文本' },
    ],
    defaultProps: { type: 'text' },
  },

  Card: {
    name: 'Card',
    category: 'layout',
    props: [
      { name: 'children', type: 'children', required: true },
      { name: 'padding', type: 'enum', options: ['none', 'sm', 'md', 'lg'], default: 'md' },
      { name: 'shadow', type: 'enum', options: ['none', 'sm', 'md', 'lg'], default: 'sm' },
      { name: 'border', type: 'boolean', default: true },
    ],
    defaultProps: { padding: 'md', shadow: 'sm', border: true },
  },

  Container: {
    name: 'Container',
    category: 'layout',
    props: [
      { name: 'children', type: 'children', required: true },
      { name: 'maxWidth', type: 'enum', options: ['sm', 'md', 'lg', 'xl', 'full'], default: 'lg' },
      { name: 'centered', type: 'boolean', default: true },
      { name: 'padding', type: 'enum', options: ['none', 'sm', 'md', 'lg'], default: 'md' },
    ],
    defaultProps: { maxWidth: 'lg', centered: true, padding: 'md' },
  },

  Text: {
    name: 'Text',
    category: 'display',
    props: [
      { name: 'children', type: 'children', required: true },
      { name: 'as', type: 'enum', options: ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], default: 'p' },
      { name: 'size', type: 'enum', options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'], default: 'base' },
      { name: 'weight', type: 'enum', options: ['normal', 'medium', 'semibold', 'bold'], default: 'normal' },
      { name: 'color', type: 'enum', options: ['default', 'muted', 'primary', 'success', 'error', 'warning'], default: 'default' },
    ],
    defaultProps: { as: 'p', size: 'base', weight: 'normal', color: 'default' },
  },

  Stack: {
    name: 'Stack',
    category: 'layout',
    props: [
      { name: 'children', type: 'children', required: true },
      { name: 'direction', type: 'enum', options: ['row', 'column'], default: 'column' },
      { name: 'gap', type: 'enum', options: ['xs', 'sm', 'md', 'lg', 'xl'], default: 'md' },
      { name: 'align', type: 'enum', options: ['start', 'center', 'end', 'stretch'], default: 'stretch' },
      { name: 'justify', type: 'enum', options: ['start', 'center', 'end', 'between', 'around'], default: 'start' },
    ],
    defaultProps: { direction: 'column', gap: 'md', align: 'stretch', justify: 'start' },
  },

  Divider: {
    name: 'Divider',
    category: 'display',
    props: [
      { name: 'orientation', type: 'enum', options: ['horizontal', 'vertical'], default: 'horizontal' },
    ],
    defaultProps: { orientation: 'horizontal' },
  },

  Badge: {
    name: 'Badge',
    category: 'display',
    props: [
      { name: 'children', type: 'children', required: true },
      { name: 'variant', type: 'enum', options: ['default', 'primary', 'success', 'warning', 'error'], default: 'default' },
      { name: 'size', type: 'enum', options: ['sm', 'md'], default: 'md' },
    ],
    defaultProps: { variant: 'default', size: 'md' },
  },
};
