/**
 * 组件渲染器
 * 根据原型组件定义动态渲染 React 组件
 */

'use client';

import React from 'react';
import type { PrototypeComponent, ComponentInteraction, DesignSystem } from '../types';

interface ComponentRendererProps {
  component: PrototypeComponent;
  designSystem: DesignSystem;
  isInteractive?: boolean;
  onInteraction?: (interaction: ComponentInteraction) => void;
  highlightedId?: string;
}

// 占位符组件 - 当组件类型未找到时显示
function PlaceholderComponent({ type }: { type: string }) {
  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
      <div className="text-gray-400 dark:text-gray-500 text-sm">
        未知组件: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{type}</code>
      </div>
    </div>
  );
}

export function ComponentRenderer({
  component,
  designSystem,
  isInteractive = true,
  onInteraction,
  highlightedId,
}: ComponentRendererProps) {
  const Component = designSystem.componentMap[component.type];

  // 处理交互事件
  const handleInteraction = (interaction: ComponentInteraction) => {
    if (!isInteractive || !onInteraction) return;
    onInteraction(interaction);
  };

  // 为组件添加交互处理器
  const interactionHandlers: Record<string, () => void> = {};
  if (isInteractive && component.interactions) {
    component.interactions.forEach((interaction) => {
      switch (interaction.trigger) {
        case 'click':
          interactionHandlers.onClick = () => handleInteraction(interaction);
          break;
        case 'hover':
          interactionHandlers.onMouseEnter = () => handleInteraction(interaction);
          break;
        case 'focus':
          interactionHandlers.onFocus = () => handleInteraction(interaction);
          break;
        case 'change':
          interactionHandlers.onChange = () => handleInteraction(interaction);
          break;
        case 'submit':
          interactionHandlers.onSubmit = () => handleInteraction(interaction);
          break;
      }
    });
  }

  // 组件未找到时显示占位符
  if (!Component) {
    return <PlaceholderComponent type={component.type} />;
  }

  // 递归渲染子组件
  const children = component.children?.map((child) => (
    <ComponentRenderer
      key={child.id}
      component={child}
      designSystem={designSystem}
      isInteractive={isInteractive}
      onInteraction={onInteraction}
      highlightedId={highlightedId}
    />
  ));

  // 高亮当前组件
  const isHighlighted = highlightedId === component.id;
  const highlightStyles = isHighlighted
    ? {
        outline: '2px solid #3b82f6',
        outlineOffset: '2px',
        borderRadius: '4px',
      }
    : {};

  return (
    <div
      data-component-id={component.id}
      style={highlightStyles}
      className={isHighlighted ? 'relative' : ''}
    >
      {isHighlighted && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
          {component.type}
        </div>
      )}
      <Component {...component.props} {...interactionHandlers}>
        {children}
      </Component>
    </div>
  );
}
