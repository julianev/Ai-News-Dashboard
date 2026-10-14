import { describe, it, expect } from 'vitest';
import { resolveLlmConfig } from './llm.js';
import type { Settings } from '../../src/types/index.js';

const settings = {
  llmBaseUrl: 'https://llm.mlcloud.uni-tuebingen.de/v1',
  llmModel: 'Qwen/Qwen3.6-35B-A3B',
  llmMaxTokens: 6144,
} as Settings;

describe('resolveLlmConfig', () => {
  it('uses LITELLM_API_KEY and settings defaults', () => {
    const c = resolveLlmConfig(settings, { LITELLM_API_KEY: 'sk-x' });
    expect(c.baseUrl).toBe('https://llm.mlcloud.uni-tuebingen.de/v1');
    expect(c.model).toBe('Qwen/Qwen3.6-35B-A3B');
    expect(c.apiKey).toBe('sk-x');
    expect(c.maxTokens).toBe(6144);
  });
  it('falls back to OPENROUTER_API_KEY', () => {
    const c = resolveLlmConfig(
      { ...settings, llmBaseUrl: 'https://openrouter.ai/api/v1' },
      { OPENROUTER_API_KEY: 'sk-or' },
    );
    expect(c.apiKey).toBe('sk-or');
  });
  it('treats an empty-string LITELLM_API_KEY as unset (CI injects "" for undefined secrets)', () => {
    const c = resolveLlmConfig(
      { ...settings, llmBaseUrl: 'https://openrouter.ai/api/v1' },
      { LITELLM_API_KEY: '', OPENROUTER_API_KEY: 'sk-or' },
    );
    expect(c.apiKey).toBe('sk-or');
  });
  it('throws a clear error when no key is set', () => {
    expect(() => resolveLlmConfig(settings, {})).toThrow(/LITELLM_API_KEY/);
  });
});
