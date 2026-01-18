/**
 * 统一 LLM 客户端
 */

import type { LLMConfig, LLMMessage, LLMResponse, LLMStreamChunk, LLMProviderInterface } from './types';
import { ClaudeProvider } from './providers/claude';
import { OpenAIProvider } from './providers/openai';
import { OpenRouterProvider } from './providers/openrouter';

function getProvider(provider: LLMConfig['provider']): LLMProviderInterface {
  switch (provider) {
    case 'claude':
      return new ClaudeProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'openrouter':
      return new OpenRouterProvider();
    case 'custom':
      // Custom provider uses OpenAI-compatible API
      return new OpenAIProvider();
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export class LLMClient {
  private provider: LLMProviderInterface;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.provider = getProvider(config.provider);
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    return this.provider.chat(messages, this.config);
  }

  async *stream(messages: LLMMessage[]): AsyncGenerator<LLMStreamChunk> {
    yield* this.provider.stream(messages, this.config);
  }
}

export function createLLMClient(config: LLMConfig): LLMClient {
  return new LLMClient(config);
}
