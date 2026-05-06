import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ISymptomCache, type AppSymptom } from '../../domain/ports/symptom-cache.port';

@Injectable()
export class InMemorySymptomCache implements ISymptomCache {
  private knownCuis = new Set<string>();

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(cui: string): Promise<AppSymptom | undefined> {
    return await this.cacheManager.get<AppSymptom>(`symptom:${cui}`);
  }

  async set(cui: string, symptom: AppSymptom): Promise<void> {
    await this.cacheManager.set(`symptom:${cui}`, symptom, 3600000); // 1 hour TTL
    this.knownCuis.add(cui);
  }

  async getAll(): Promise<AppSymptom[]> {
    const results: AppSymptom[] = [];
    for (const cui of this.knownCuis) {
      const cached = await this.cacheManager.get<AppSymptom>(`symptom:${cui}`);
      if (cached) {
        results.push(cached);
      }
    }
    return results;
  }
    
  async clear(): Promise<void> {
    await this.cacheManager.clear();
    this.knownCuis.clear();
  }
}

