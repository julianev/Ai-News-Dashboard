import type { ModelRelease } from '../../src/types/index.js';

export interface OpenRouterModel {
  id: string;
  name: string;
  created?: number;
  context_length?: number;
  pricing?: { prompt?: string; completion?: string };
  architecture?: { modality?: string };
}

export function mapOpenRouterModel(m: OpenRouterModel): ModelRelease {
  const perM = (s?: string) => {
    const n = parseFloat(s ?? '');
    return Number.isFinite(n) ? n * 1_000_000 : 0;
  };
  return {
    id: m.id,
    name: m.name ?? m.id,
    provider: m.id.split('/')[0] ?? 'unknown',
    releaseDate: m.created ? new Date(m.created * 1000).toISOString() : '',
    contextLength: m.context_length ?? 0,
    inputPrice: perM(m.pricing?.prompt),
    outputPrice: perM(m.pricing?.completion),
    modality: m.architecture?.modality ?? 'text',
    url: `https://openrouter.ai/${m.id}`,
  };
}
