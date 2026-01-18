/**
 * LLM 适配层类型定义
 * 支持 Claude、OpenAI、OpenRouter 等多种 Provider
 */

// Provider 类型
export type LLMProvider = 'claude' | 'openai' | 'openrouter' | 'custom';

// LLM 配置
export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

// 消息角色
export type MessageRole = 'system' | 'user' | 'assistant';

// 消息格式
export interface LLMMessage {
  role: MessageRole;
  content: string;
}

// 响应格式
export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  finishReason?: 'stop' | 'length' | 'content_filter' | 'tool_calls';
}

// 流式响应 chunk
export interface LLMStreamChunk {
  content: string;
  done: boolean;
}

// Provider 接口
export interface LLMProviderInterface {
  chat(messages: LLMMessage[], config: LLMConfig): Promise<LLMResponse>;
  stream(messages: LLMMessage[], config: LLMConfig): AsyncGenerator<LLMStreamChunk>;
}

// 预设模型列表
export const PRESET_MODELS: Record<LLMProvider, string[]> = {
  claude: [
    'claude-sonnet-4-20250514',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
  ],
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
  ],
  openrouter: [
    'anthropic/claude-sonnet-4',
    'anthropic/claude-3.5-sonnet',
    'openai/gpt-4o',
    'google/gemini-pro-1.5',
    'meta-llama/llama-3.1-405b-instruct',
  ],
  custom: [],
};

// Provider 默认配置
export const PROVIDER_DEFAULTS: Record<LLMProvider, { baseUrl: string; defaultModel: string }> = {
  claude: {
    baseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-sonnet-4-20250514',
  },
  openai: {
    baseUrl: 'https://api.openai.com',
    defaultModel: 'gpt-4o',
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api',
    defaultModel: 'anthropic/claude-sonnet-4',
  },
  custom: {
    baseUrl: '',
    defaultModel: '',
  },
};
