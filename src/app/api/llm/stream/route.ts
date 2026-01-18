/**
 * LLM Stream API Route
 * POST /api/llm/stream - 处理流式对话请求
 */

import type { LLMConfig, LLMMessage } from '@/lib/llm/types';
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
      return new Response(
        JSON.stringify({ error: 'messages is required and must be a non-empty array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!config || !config.provider || !config.apiKey || !config.model) {
      return new Response(
        JSON.stringify({ error: 'config with provider, apiKey, and model is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取 provider
    const provider = getProvider(config.provider);

    // 创建 ReadableStream 用于 SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // 调用流式接口
          for await (const chunk of provider.stream(messages, config)) {
            // 格式化为 SSE 格式: data: {"content": "..."}\n\n
            const data = JSON.stringify({ content: chunk.content, done: chunk.done });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));

            // 如果完成，关闭流
            if (chunk.done) {
              controller.close();
              return;
            }
          }

          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorData = JSON.stringify({ error: errorMessage });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    // 返回 SSE 响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('LLM Stream API Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
