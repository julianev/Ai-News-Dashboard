import { describe, it, expect } from 'vitest';
import { mapOpenRouterModel } from './models-core.js';

describe('mapOpenRouterModel', () => {
  it('maps a full entry', () => {
    const r = mapOpenRouterModel({
      id: 'anthropic/claude-x', name: 'Anthropic: Claude X', created: 1700000000,
      context_length: 200000, pricing: { prompt: '0.000003', completion: '0.000015' },
      architecture: { modality: 'text->text' },
    });
    expect(r.provider).toBe('anthropic');
    expect(r.contextLength).toBe(200000);
    expect(r.inputPrice).toBeCloseTo(3, 5);   // per 1M tokens
    expect(r.outputPrice).toBeCloseTo(15, 5);
    expect(r.releaseDate).toBe(new Date(1700000000 * 1000).toISOString());
  });
  it('tolerates missing pricing/created', () => {
    const r = mapOpenRouterModel({ id: 'x/y', name: 'Y' });
    expect(r.inputPrice).toBe(0);
    expect(r.outputPrice).toBe(0);
    expect(r.contextLength).toBe(0);
    expect(r.releaseDate).toBe('');
    expect(Number.isNaN(r.inputPrice)).toBe(false);
  });
});
