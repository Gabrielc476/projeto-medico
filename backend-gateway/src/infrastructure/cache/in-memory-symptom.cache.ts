import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ISymptomCache, type AppSymptom } from '../../domain/ports/symptom-cache.port';

@Injectable()
export class InMemorySymptomCache implements ISymptomCache {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(cui: string): Promise<AppSymptom | undefined> {
    return await this.cacheManager.get<AppSymptom>(`symptom:${cui}`);
  }

  async set(cui: string, symptom: AppSymptom): Promise<void> {
    await this.cacheManager.set(`symptom:${cui}`, symptom, 3600000); // 1 hour TTL
  }

  async getAll(): Promise<AppSymptom[]> {
    // In cache-manager v5+, listing keys is store-dependent. 
    // For now, we return empty or implement a secondary index if needed.
    // For medical symptoms, this list is usually small and static enough to be fetched once.
    return [];
  }
    
  async clear(): Promise<void> {
    await this.cacheManager.clear();
  }
}
