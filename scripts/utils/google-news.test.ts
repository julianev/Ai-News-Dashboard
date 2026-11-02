import { describe, it, expect } from 'vitest';
import { googleNewsUrl } from './index.js';

describe('googleNewsUrl', () => {
  it('builds a site-search RSS url with terms', () => {
    const u = googleNewsUrl('anthropic.com', ['education', 'learning']);
    expect(u).toContain('news.google.com/rss/search');
    expect(decodeURIComponent(u)).toContain('site:anthropic.com');
    expect(decodeURIComponent(u)).toContain('education OR learning');
  });
  it('works with no terms', () => {
    expect(decodeURIComponent(googleNewsUrl('x.ai', []))).toContain('site:x.ai');
  });
});
