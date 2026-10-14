/**
 * Fetch the newest model releases from OpenRouter (keyless) for the model board.
 */
import 'dotenv/config';
import { fetchWithRetry, writeJsonFile, getDataPath, readJsonFile, getConfigPath } from './utils/index.js';
import { mapOpenRouterModel, type OpenRouterModel } from './utils/models-core.js';
import type { ModelRelease } from '../src/types/index.js';

async function main() {
  console.log('=== Fetching Model Releases ===\n');
  try {
    const res = await fetchWithRetry('https://openrouter.ai/api/v1/models');
    const { data } = (await res.json()) as { data: OpenRouterModel[] };
    const { maxItemsPerSection } = readJsonFile<{ maxItemsPerSection: number }>(getConfigPath('settings.json'));
    const models: ModelRelease[] = data
      .map(mapOpenRouterModel)
      .filter((m) => m.releaseDate)
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
      .slice(0, maxItemsPerSection);
    writeJsonFile(getDataPath('models.json'), models);
    console.log(`\n✅ Models: ${models.length} newest releases`);
  } catch (e) {
    // Fault-tolerant like the other fetchers: never abort the daily chain; keep last-good models.json.
    console.warn(`  ⚠ Model fetch failed, keeping existing models.json: ${(e as Error).message}`);
  }
  process.exit(0);
}

main();
