import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemorySymptomCache } from './in-memory-symptom.cache';
import { Cache } from 'cache-manager';

describe('InMemorySymptomCache', () => {
  let cache: InMemorySymptomCache;
  let mockCacheManager: Cache;

  beforeEach(() => {
    mockCacheManager = {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
      store: {
        keys: vi.fn(),
      },
    } as any;

    cache = new InMemorySymptomCache(mockCacheManager);
  });

  it('should get a symptom from cache manager', async () => {
    const mockSymptom = { cui: 'C01', clinicalName: 'Fever', laymanTerm: 'Febre' };
    vi.mocked(mockCacheManager.get).mockResolvedValue(mockSymptom);

    const result = await cache.get('C01');

    expect(mockCacheManager.get).toHaveBeenCalledWith('symptom:C01');
    expect(result).toEqual(mockSymptom);
  });

  it('should set a symptom in cache manager with TTL', async () => {
    const mockSymptom = { cui: 'C01', clinicalName: 'Fever', laymanTerm: 'Febre' };

    await cache.set('C01', mockSymptom);

    expect(mockCacheManager.set).toHaveBeenCalledWith('symptom:C01', mockSymptom, 3600000);
  });
});
