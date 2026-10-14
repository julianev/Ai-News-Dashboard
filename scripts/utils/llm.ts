import { fetchWithRetry } from './index.js';
import type { Settings } from '../../src/types/index.js';

export interface LlmConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
  maxTokens: number;
}

/**
 * Resolve the OpenAI-compatible LLM backend from settings + env.
 * Works with any provider via settings.llmBaseUrl (OpenRouter by default); the key comes
 * from OPENROUTER_API_KEY, or LITELLM_API_KEY if you point llmBaseUrl at a LiteLLM gateway.
 */
export function resolveLlmConfig(settings: Settings, env: Record<string, string | undefined>): LlmConfig {
  // Use || not ?? — CI injects an empty string for an undefined secret, and '' must
  // fall through to the next option rather than resolve as a (blank) key.
  const apiKey = env.LITELLM_API_KEY || env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('No LLM key: set OPENROUTER_API_KEY (or LITELLM_API_KEY) in the environment.');
  }
  return {
    baseUrl: settings.llmBaseUrl,
    model: settings.llmModel,
    apiKey,
    maxTokens: settings.llmMaxTokens,
  };
}

/** Call the chat-completions endpoint and return the first choice's text. */
export async function chatCompletion(
  cfg: LlmConfig,
  messages: { role: string; content: string }[],
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  const body: Record<string, unknown> = {
    model: cfg.model,
    messages,
    max_tokens: opts.maxTokens ?? cfg.maxTokens,
  };
  if (opts.temperature !== undefined) body.temperature = opts.temperature;
  const res = await fetchWithRetry(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? '';
}
