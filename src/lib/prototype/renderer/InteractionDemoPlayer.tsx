/**
 * 交互演示播放器
 * 播放交互规则的演示动画
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { InteractionDemo } from '../types';
import { useDesignSystem } from '../design-systems/hooks';
import { ComponentRenderer } from './ComponentRenderer';

interface InteractionDemoPlayerProps {
  demo: InteractionDemo;
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
}

export function InteractionDemoPlayer({
  demo,
  autoPlay = false,
  loop = false,
  className = '',
}: InteractionDemoPlayerProps) {
  const designSystem = useDesignSystem();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const currentStep = demo.demoSteps[currentStepIndex];
  const totalSteps = demo.demoSteps.length;
  const highlightedId = useMemo(() => {
    const step = demo.demoSteps[currentStepIndex];
    if (!step) return undefined;
    if (step.action === 'showResult' || step.action === 'wait') return undefined;
    return step.targetId;
  }, [demo.demoSteps, currentStepIndex]);

  // 自动播放逻辑
  useEffect(() => {
    if (!isPlaying || totalSteps === 0) return;

    const step = demo.demoSteps[currentStepIndex];

    const duration = step.duration || 1500;
    const timer = setTimeout(() => {
      if (currentStepIndex < totalSteps - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else if (loop) {
        setCurrentStepIndex(0);
      } else {
        setIsPlaying(false);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, totalSteps, loop, demo.demoSteps]);

  // 手动控制
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden ${className}`}>
      {/* 演示头部 */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-purple-500 font-medium text-sm">
            {demo.trigger}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="text-gray-600 dark:text-gray-300 text-sm">
            {demo.response}
          </span>
        </div>
      </div>

      {/* 演示舞台 */}
      <div className="p-6 bg-white dark:bg-gray-900 min-h-[200px]">
        <ComponentRenderer
          component={demo.demoComponent}
          designSystem={designSystem}
          isInteractive={false}
          highlightedId={highlightedId}
        />
      </div>

      {/* 控制栏 */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {/* 播放控制 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="重置"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
              title="上一步"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handlePlayPause}
              className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full"
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === totalSteps - 1}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
              title="下一步"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 步骤指示器 */}
          <div className="flex items-center gap-1">
            {demo.demoSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStepIndex
                    ? 'bg-purple-500'
                    : index < currentStepIndex
                    ? 'bg-purple-300'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* 步骤信息 */}
          <div className="text-xs text-gray-500">
            {currentStep?.action || '就绪'} ({currentStepIndex + 1}/{totalSteps})
          </div>
        </div>
      </div>
    </div>
  );
}
