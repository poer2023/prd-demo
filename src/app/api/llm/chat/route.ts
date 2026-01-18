/**
 * LLM Chat API Route
 * POST /api/llm/chat - 处理普通对话请求
 */

import { NextResponse } from 'next/server';
import type { LLMConfig, LLMMessage, LLMResponse } from '@/lib/llm/types';
import { ClaudeProvider } from '@/lib/llm/providers/claude';
import { OpenAIProvider } from '@/lib/llm/providers/openai';

// 根据 provider 获取对应的实现
function getProvider(provider: LLMConfig['provider']) {
  switch (provider) {
    case 'claude':
      return new ClaudeProvider();
    case 'openai':
    case 'openrouter':
      return new OpenAIProvider();
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, config } = body as {
      messages: LLMMessage[];
      config: LLMConfig;
    };

    // 验证必要参数
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!config || !config.provider || !config.apiKey || !config.model) {
      return NextResponse.json(
        { error: 'config with provider, apiKey, and model is required' },
        { status: 400 }
      );
    }

    // 获取 provider 并调用 chat
    const provider = getProvider(config.provider);
    const response: LLMResponse = await provider.chat(messages, config);

    return NextResponse.json(response);
  } catch (error) {
    console.error('LLM Chat API Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
